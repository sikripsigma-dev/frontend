<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-4">Manajemen Role & Hak Akses</h1>

    <!-- pilih role -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedRoleId"
          :items="roles"
          item-title="name"
          item-value="id"
          :loading="rolesPend"
          label="Pilih Role"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="selectedRoleId"
      type="info"
      class="mb-4"
    >
      Hak akses berikut akan berlaku untuk
      <strong>{{ roleName }}</strong>.
      Centang/lepaskan sesuai kebutuhan.
    </v-alert>

    <!-- Tabel permission -->
    <v-card v-if="selectedRoleId" elevation="2" rounded="lg">
      <v-card-text>
        <v-alert v-if="accessPend" type="info" variant="tonal" class="mb-3">Memuat data akses…</v-alert>
        <v-alert v-else-if="accessErr" type="error" variant="tonal" class="mb-3">Gagal memuat akses.</v-alert>

        <v-text-field
          v-model="q"
          prepend-inner-icon="mdi-magnify"
          label="Cari menu…"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          hide-details
        />

        <v-data-table
          :headers="headers"
          :items="rowsFiltered"
          item-key="id"
          :items-per-page="100"
          class="elevation-1"
          density="comfortable"
          :loading="accessPend || saving"
          hide-default-footer
        >
          <!-- Kolom Nama Menu (dengan indent level) -->
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <span :style="{ paddingLeft: `${item.level * 20}px` }">
                <v-icon size="16" class="mr-2" v-if="!item.icon">mdi-dots-horizontal-circle-outline</v-icon>
                <v-icon size="16" class="mr-2" v-else>{{ item.icon }}</v-icon>
                <span :class="{ 'text-disabled': !item.is_active }">{{ item.name }}</span>
                <span v-if="item.url" class="text-caption text-medium-emphasis ml-2">({{ item.url }})</span>
              </span>
            </div>
          </template>

          <!-- Checkbox kolom -->
          <template #item.can_view="{ item }">
            <v-checkbox
              v-model="access[item.id].can_view"
              density="compact" hide-details
              @change="onToggleView(item.id, access[item.id].can_view)"
            />
          </template>
          <template #item.can_add="{ item }">
            <v-checkbox v-model="access[item.id].can_add" density="compact" hide-details @change="ensureView(item.id, true)" />
          </template>
          <template #item.can_edit="{ item }">
            <v-checkbox v-model="access[item.id].can_edit" density="compact" hide-details @change="ensureView(item.id, true)" />
          </template>
          <template #item.can_delete="{ item }">
            <v-checkbox v-model="access[item.id].can_delete" density="compact" hide-details @change="ensureView(item.id, true)" />
          </template>
          <template #item.can_approve="{ item }">
            <v-checkbox v-model="access[item.id].can_approve" density="compact" hide-details @change="ensureView(item.id, true)" />
          </template>
          <template #item.can_export="{ item }">
            <v-checkbox v-model="access[item.id].can_export" density="compact" hide-details @change="ensureView(item.id, true)" />
          </template>
        </v-data-table>

        <div v-if="!accessPend && rows.length === 0" class="text-medium-emphasis text-caption mt-3">
          Tidak ada menu.
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="saving || accessPend" @click="reload">Muat Ulang</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="accessPend" @click="savePermissions">Simpan Perubahan</v-btn>
      </v-card-actions>
    </v-card>

    <v-alert v-else type="warning" variant="tonal">
      Pilih role terlebih dahulu untuk mengatur hak akses.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'profile' })

import { ref, computed, reactive, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useHakAkses, type MenuAccessNode, type UpdateMenuAccessItem } from '@/composables/useHakAkses'

const toast = useToast()

// composable BE
const {
  roles, rolesPend, fetchRoles,
  menuTree, accessPend, accessErr, fetchMenuAccessByRole, updateMenuAccessBulk
} = useHakAkses()

// state
const selectedRoleId = ref<number | null>(null)
const roleName = computed(() => roles.value.find(r => r.id === selectedRoleId.value)?.name || '-')
const q = ref('')
const saving = ref(false)

// headers tabel
const headers = [
  { title: 'Nama Menu', key: 'name', sortable: false },
  { title: 'View', key: 'can_view', align: 'center', sortable: false, width: 80 },
  { title: 'Add', key: 'can_add', align: 'center', sortable: false, width: 80 },
  { title: 'Edit', key: 'can_edit', align: 'center', sortable: false, width: 80 },
  { title: 'Delete', key: 'can_delete', align: 'center', sortable: false, width: 90 },
  { title: 'Approve', key: 'can_approve', align: 'center', sortable: false, width: 100 },
  { title: 'Export', key: 'can_export', align: 'center', sortable: false, width: 90 },
]

// akses map per menu id (agar v-model enak)
type Flags = { can_view: boolean; can_add: boolean; can_edit: boolean; can_delete: boolean; can_approve: boolean; can_export: boolean }
const access = reactive<Record<number, Flags>>({})

// struktur flat untuk table + relasi parent-child
type Row = { id: number; name: string; url?: string | null; icon?: string; is_active: boolean; level: number; parent_id?: number | null }
const rows = ref<Row[]>([])
const childrenMap = reactive<Record<number, number[]>>({})  // id -> [childIds]
const parentMap = reactive<Record<number, number | null>>({})

const buildRows = (nodes: MenuAccessNode[], level = 0, parentId: number | null = null, out: Row[] = []) => {
  for (const n of nodes) {
    out.push({ id: n.id, name: n.name, url: n.url, icon: n.icon, is_active: n.is_active, level, parent_id: parentId })
    // map parent/child
    parentMap[n.id] = parentId
    if (!childrenMap[parentId || 0]) childrenMap[parentId || 0] = []
    if (parentId !== null) {
      if (!childrenMap[parentId]) childrenMap[parentId] = []
      childrenMap[parentId].push(n.id)
    }
    // isi access flags
    access[n.id] = {
      can_view: !!n.can_view,
      can_add: !!n.can_add,
      can_edit: !!n.can_edit,
      can_delete: !!n.can_delete,
      can_approve: !!n.can_approve,
      can_export: !!n.can_export,
    }
    if (n.children?.length) buildRows(n.children, level + 1, n.id, out)
  }
  return out
}

const clearMaps = () => {
  rows.value = []
  for (const k of Object.keys(access)) delete access[k as any]
  for (const k of Object.keys(childrenMap)) delete childrenMap[k as any]
  for (const k of Object.keys(parentMap)) delete parentMap[k as any]
}

// filter pencarian
const rowsFiltered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(r => r.name.toLowerCase().includes(term) || (r.url || '').toLowerCase().includes(term))
})

// aturan: kalau kolom selain View diaktifkan → paksa view = true
const ensureView = (id: number, cascadeUp = false) => {
  const f = access[id]
  if (!f) return
  if (f.can_add || f.can_edit || f.can_delete || f.can_approve || f.can_export) {
    f.can_view = true
    if (cascadeUp) {
      // naik ke orang tua agar minimal View true di parent (opsional, bisa dimatikan)
      const pid = parentMap[id]
      if (pid) {
        access[pid].can_view = true
      }
    }
  }
}

// jika View dimatikan → matikan semua yang lain; opsional cascade ke anak
const onToggleView = (id: number, next: boolean) => {
  const f = access[id]
  if (!f) return
  if (!next) {
    f.can_add = f.can_edit = f.can_delete = f.can_approve = f.can_export = false
    // cascade ke semua anak juga nonaktif (opsional, cocok untuk UX seperti screenshot)
    const stack = [...(childrenMap[id] || [])]
    while (stack.length) {
      const cid = stack.pop() as number
      const cf = access[cid]
      if (cf) {
        cf.can_view = false
        cf.can_add = cf.can_edit = cf.can_delete = cf.can_approve = cf.can_export = false
      }
      if (childrenMap[cid]?.length) stack.push(...childrenMap[cid])
    }
  }
}

// load roles, pilih role pertama otomatis (opsional)
await fetchRoles()
if (!selectedRoleId.value && roles.value.length) {
  selectedRoleId.value = roles.value[0].id
}

// ambil akses saat role berubah
watch(selectedRoleId, async (rid) => {
  if (!rid) return
  try {
    clearMaps()
    await fetchMenuAccessByRole(rid)
    // buildRows(menuTree.value, 0, null, [])
    rows.value = buildRows(menuTree.value, 0, null, [])
  } catch {
    // ditangani oleh accessErr alert
  }
}, { immediate: true })

const reload = async () => {
  if (!selectedRoleId.value) return
  clearMaps()
  await fetchMenuAccessByRole(selectedRoleId.value)
  buildRows(menuTree.value, 0, null, [])
}

const savePermissions = async () => {
  if (!selectedRoleId.value) return
  saving.value = true
  try {
    // siapkan payload dari access map (hanya id yang ada di rows)
    const items: UpdateMenuAccessItem[] = rows.value.map(r => ({
      menu_id: r.id,
      ...access[r.id]
    }))
    await updateMenuAccessBulk(selectedRoleId.value, items)
    toast.success('Hak akses berhasil disimpan')
    await reload()
  } catch (e: any) {
    toast.error(e?.data?.error || 'Gagal menyimpan hak akses')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.text-disabled { opacity: .6; }
</style>
