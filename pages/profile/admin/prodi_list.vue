<template>
  <v-container class="py-6">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-school</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Manajemen Program Studi</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Kelola semua program studi yang terdaftar dalam sistem
            </p>
          </div>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-col>
    </v-row>

    <!-- Action Bar -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Cari program studi..."
              outlined
              dense
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="4" md="6" class="text-right">
            <v-btn color="primary" @click="openAddDialog">
              <v-icon left>mdi-plus</v-icon>
              Tambah Program Studi
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredProdis"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-1"
        :loading="pending"
        loading-text="Memuat data..."
      >
        <template #item.created_at="{ item }">
          <span>{{ fmtDate(item.created_at) }}</span>
        </template>
        <template #item.updated_at="{ item }">
          <span>{{ fmtDate(item.updated_at) }}</span>
        </template>
        <template #item.actions="{ item }">
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn icon size="small" v-bind="props" @click="editRow(item)">
                <v-icon size="18" color="primary">mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn icon size="small" v-bind="props" @click="confirmDelete(item)">
                <v-icon size="18" color="error">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Hapus</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Add/Edit -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editing ? 'Edit Program Studi' : 'Tambah Program Studi' }}</span>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-text-field
              v-model="form.name"
              label="Nama Program Studi*"
              outlined
              :rules="[required, max255]"
              autofocus
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="closeDialog">Batal</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Delete -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus <strong>{{ selected?.name }}</strong>?
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
import { useDataProdi } from '@/composables/useDataProdi'

import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'profile' })

const {
  prodis,
  pending,
  error,
  getProdis,
  createProdi,
  updateProdi,
  deleteProdi
} = useDataProdi()

const toast = useToast()

const searchQuery = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editing = ref(false)
const saving = ref(false)
const selected = ref<any | null>(null)
const formRef = ref<any>(null)
const form = ref({ id: '', name: '' })

const headers = [
  { title: 'Nama Program Studi', value: 'name' },
  { title: 'Dibuat', value: 'created_at' },
  { title: 'Diupdate', value: 'updated_at' },
  { title: 'Aksi', value: 'actions', align: 'center', sortable: false, width: 120 }
]

// rules
const required = (v: string) => !!(v && v.trim()) || 'Wajib diisi'
const max255 = (v: string) => (!v || v.length <= 255) || 'Maksimal 255 karakter'

// helpers
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

const filteredProdis = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return prodis.value.filter(u => !q || u.name.toLowerCase().includes(q))
})

const openAddDialog = () => {
  editing.value = false
  form.value = { id: '', name: '' }
  dialog.value = true
}
const editRow = (row: any) => {
  editing.value = true
  form.value = { id: row.id, name: row.name }
  dialog.value = true
}
const closeDialog = () => {
  dialog.value = false
  formRef.value?.resetValidation()
}
const save = async () => {
  const ok = formRef.value?.validate()
  if (!ok) return
  saving.value = true
  try {
    if (editing.value) {
      await updateProdi(form.value.id, { name: form.value.name })
      toast.success('Program studi berhasil diperbarui')
    } else {
      await createProdi({ name: form.value.name })
      toast.success('Program studi berhasil ditambahkan')
    }
    dialog.value = false
  } catch (err: any) {
    toast.error(err?.data?.error || 'Gagal menyimpan program studi')
  } finally {
    saving.value = false
  }
}
const confirmDelete = (row: any) => {
  selected.value = row
  deleteDialog.value = true
}
const doDelete = async () => {
  if (!selected.value) return
  saving.value = true
  try {
    await deleteProdi(selected.value.id)
    toast.success('Program studi berhasil dihapus')
    deleteDialog.value = false
  } catch (err: any) {
    toast.error(err?.data?.error || 'Gagal menghapus program studi')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await getProdis()
  } catch {
    toast.error('Gagal memuat daftar program studi')
  }
})
</script>

<style scoped>
.v-card { transition: all .3s ease; }
.v-card:hover { box-shadow: 0 6px 12px rgba(0,0,0,.1) !important; }
.v-data-table >>> .v-data-table-header { background-color: #f5f5f5; }
.v-data-table >>> th { font-weight: 600 !important; }
</style>
