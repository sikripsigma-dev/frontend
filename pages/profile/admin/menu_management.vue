<template>
  <v-container class="py-6">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-view-list</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Manajemen Menu</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Kelola struktur menu, status aktif, ikon, dan URL navigasi.
            </p>
          </div>
        </div>
        <v-divider class="my-4" />
      </v-col>
    </v-row>

    <!-- Action Bar -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="q"
              prepend-inner-icon="mdi-magnify"
              label="Cari menu..."
              outlined
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="4" md="6" class="text-right">
            <v-btn color="primary" @click="openAdd(null)" prepend-icon="mdi-plus">
              Tambah Menu (Root)
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tree -->
    <v-card elevation="2" rounded="lg">
      <v-card-text>
        <v-alert v-if="pending" type="info" variant="tonal" class="mt-2">
          Memuat data menu...
        </v-alert>

        <v-alert v-else-if="error" type="error" variant="tonal" class="mt-2">
          Gagal memuat menu.
        </v-alert>

        <v-alert v-else-if="filteredTree.length === 0" type="warning" variant="tonal" class="mt-2">
          Tidak ada menu yang ditampilkan.
          <div class="text-caption mt-1">Items (debug): {{ itemsCount }}</div>
        </v-alert>

        <MenuTree
          v-else
          :nodes="filteredTree"
          @edit="openEdit"
          @add-child="openAdd"
          @delete="confirmDelete"
          @toggle-active="toggleActive"
        />
      </v-card-text>
    </v-card>

    <!-- Dialog Add/Edit -->
    <v-dialog v-model="dialog" max-width="640" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editing ? 'Edit Menu' : 'Tambah Menu' }}</span>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.name" label="Nama*" outlined :rules="[required, max100]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.url" label="URL* (mis: /dashboard atau application/progress_report)" outlined :rules="[required, max255]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.icon" label="Icon (mdi-...)" outlined :rules="[max255]" hint="Contoh: mdi-home, mdi-account (opsional)" persistent-hint />
              </v-col>
              <v-col cols="12" sm="8">
                <v-select
                  v-model="form.parent_id"
                  :items="parentOptions"
                  item-title="label"
                  item-value="id"
                  label="Parent"
                  outlined
                  clearable
                  :return-object="false"
                />
              </v-col>
              <v-col cols="12" sm="4" class="d-flex align-center">
                <v-switch v-model="form.is_active" label="Aktif" inset color="success" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="closeDialog">Batal</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Delete -->
    <v-dialog v-model="deleteDialog" max-width="460">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Hapus <strong>{{ selected?.name }}</strong>? Jika memiliki sub-menu, mohon hapus/relokasi terlebih dahulu.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" :loading="saving" @click="doDelete">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MenuTree from '@/components/MenuTree.vue'
import { useMenu } from '@/composables/useMenu'
import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'profile' })

const menuApi: any = useMenu()
const { menus, pending, error, fetchOnce, refresh, createMenu, updateMenu, deleteMenu } = menuApi
const toast = useToast()

// state
const q = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editing = ref(false)
const saving = ref(false)
const formRef = ref<any>(null)

type MenuNode = {
  id: number
  name: string
  url?: string | null
  icon?: string
  is_active: boolean
  parent_id?: number | null
  children?: MenuNode[]
}

const form = ref<{ id?: number; name: string; url: string; icon?: string; is_active: boolean; parent_id: number | null }>({
  name: '', url: '', icon: '', is_active: true, parent_id: null
})
const selected = ref<MenuNode | null>(null)

// rules
const required = (v: string) => !!(v && v.trim()) || 'Wajib diisi'
const max100 = (v: string) => (!v || v.length <= 100) || 'Maksimal 100 karakter'
const max255 = (v: string) => (!v || v.length <= 255) || 'Maksimal 255 karakter'

// helpers
const fmtNodesToOptions = (nodes: MenuNode[], level = 0, out: { id: number, label: string }[] = []) => {
  for (const n of nodes) {
    out.push({ id: n.id, label: `${'— '.repeat(level)}${n.name}` })
    if (n.children?.length) fmtNodesToOptions(n.children, level + 1, out)
  }
  return out
}
const parentOptions = computed(() => [{ id: 0, label: '— Root —' }, ...fmtNodesToOptions(menus.value || [])])

const filterTree = (nodes: MenuNode[], term: string): MenuNode[] => {
  if (!term) return nodes
  const t = term.toLowerCase()
  const recur = (arr: MenuNode[]): MenuNode[] => {
    const res: MenuNode[] = []
    for (const n of arr) {
      const childMatches = n.children ? recur(n.children) : []
      const selfMatch = n.name.toLowerCase().includes(t) || (n.url || '').toLowerCase().includes(t)
      if (selfMatch || childMatches.length) res.push({ ...n, children: childMatches })
    }
    return res
  }
  return recur(nodes)
}
const filteredTree = computed(() => filterTree(menus.value || [], q.value))
const itemsCount   = computed(() => (menus.value ? menus.value.length : 0))

// actions
const openAdd = (parent: MenuNode | null) => {
  editing.value = false
  form.value = { name: '', url: '', icon: '', is_active: true, parent_id: parent?.id ?? null }
  dialog.value = true
}
const openEdit = (node: MenuNode) => {
  editing.value = true
  form.value = {
    id: node.id,
    name: node.name,
    url: node.url || '',
    icon: node.icon || '',
    is_active: node.is_active,
    parent_id: node.parent_id ?? null
  }
  dialog.value = true
}
const closeDialog = () => {
  dialog.value = false
  formRef.value?.resetValidation()
}

const save = async () => {
  const result = await formRef.value?.validate?.()
  const valid = typeof result === 'object' ? result.valid : result
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      url: form.value.url,
      icon: form.value.icon || '',
      is_active: form.value.is_active,
      parent_id: form.value.parent_id && form.value.parent_id !== 0 ? form.value.parent_id : null
    }
    if (editing.value && form.value.id) {
      await updateMenu(form.value.id, payload)
      toast.success('Menu berhasil diperbarui')
    } else {
      await createMenu(payload)
      toast.success('Menu berhasil ditambahkan')
    }
    dialog.value = false
  } catch (err: any) {
    toast.error(err?.data?.error || 'Gagal menyimpan menu')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (node: MenuNode) => {
  selected.value = node
  deleteDialog.value = true
}
const doDelete = async () => {
  if (!selected.value) return
  saving.value = true
  try {
    await deleteMenu(selected.value.id)
    toast.success('Menu berhasil dihapus')
    deleteDialog.value = false
  } catch (err: any) {
    toast.error(err?.data?.error || 'Gagal menghapus menu')
  } finally {
    saving.value = false
  }
}
const toggleActive = async (node: MenuNode, next: boolean) => {
  try {
    await updateMenu(node.id, {
      name: node.name,
      url: node.url || '',
      icon: node.icon || '',
      is_active: next,
      parent_id: node.parent_id ?? null
    })
    toast.success(`Menu ${next ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (err: any) {
    toast.error(err?.data?.error || 'Gagal mengubah status')
  }
}

// load data hanya sekali (share dengan sidebar)
onMounted(async () => {
  try {
    if (typeof fetchOnce === 'function') await fetchOnce()
    else await refresh()
  } catch {
    toast.error('Gagal memuat menu')
  }
})
</script>

<style scoped>
.v-list-item-subtitle { opacity: .8; }
</style>
