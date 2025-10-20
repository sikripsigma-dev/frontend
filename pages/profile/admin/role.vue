<template>
  <v-container class="py-8">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Manajemen Role</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Kelola dan atur role pengguna dalam sistem</p>
      </div>
      <v-btn color="primary" @click="openAddDialog" prepend-icon="mdi-plus">
        Tambah Role
      </v-btn>
    </div>

    <!-- List -->
    <v-card elevation="2" rounded="lg">
      <v-skeleton-loader v-if="pending" type="table" :loading="pending" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">Gagal memuat role.</v-alert>

      <v-data-table
        v-else
        :headers="headers"
        :items="roles"
        item-key="id"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <v-btn icon @click="editRole(item)">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>

          <v-btn icon @click="goToPermissions(item)">
            <v-icon color="success">mdi-shield-key</v-icon>
          </v-btn>

          <!-- <v-btn icon @click="confirmDelete(item)">
            <v-icon color="error">mdi-delete</v-icon>
          </v-btn> -->
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit -->
    <v-dialog v-model="roleDialog" max-width="480" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editingRole ? 'Edit Role' : 'Tambah Role Baru' }}</span>
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="roleForm.name"
              label="Nama Role"
              variant="outlined"
              :rules="[required, max50]"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Batal</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveRole">
            {{ editingRole ? 'Simpan' : 'Tambah' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>Hapus role <strong>{{ selectedRole?.name }}</strong>?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" :loading="saving" @click="doDelete">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'profile' })

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useRoles } from '@/composables/useRole'

const router = useRouter()
const toast = useToast()

const { roles, pending, error, fetchRoles, createRole, updateRole, deleteRole } = useRoles()

const headers = [
  { title: 'Nama Role', key: 'name' },
  { title: 'Aksi', key: 'actions', align: 'center', sortable: false, width: 160 }
]

const roleDialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)

const editingRole = ref<{ id: number; name: string } | null>(null)
const selectedRole = ref<{ id: number; name: string } | null>(null)

const formRef = ref<any>(null)
const roleForm = ref({ name: '' })

// rules
const required = (v: string) => !!(v && v.trim()) || 'Nama role wajib diisi'
const max50 = (v: string) => (!v || v.length <= 50) || 'Maksimal 50 karakter'

// actions
const openAddDialog = () => {
  editingRole.value = null
  roleForm.value = { name: '' }
  roleDialog.value = true
}

const editRole = (role: { id: number; name: string }) => {
  editingRole.value = role
  roleForm.value = { name: role.name }
  roleDialog.value = true
}

const closeDialog = () => {
  roleDialog.value = false
  formRef.value?.resetValidation()
}

const saveRole = async () => {
  const res = await formRef.value?.validate?.()
  const valid = typeof res === 'object' ? res.valid : res
  if (!valid) return

  saving.value = true
  try {
    if (editingRole.value) {
      await updateRole(editingRole.value.id, { name: roleForm.value.name.trim() })
      toast.success('Role berhasil diperbarui')
    } else {
      await createRole({ name: roleForm.value.name.trim() })
      toast.success('Role berhasil dibuat')
    }
    roleDialog.value = false
  } catch (e: any) {
    const msg = e?.data?.error || e?.message || 'Gagal menyimpan role'
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (role: { id: number; name: string }) => {
  selectedRole.value = role
  deleteDialog.value = true
}

const doDelete = async () => {
  if (!selectedRole.value) return
  saving.value = true
  try {
    await deleteRole(selectedRole.value.id) // aktifkan kalau BE punya endpoint DELETE
    toast.success('Role berhasil dihapus')
    deleteDialog.value = false
  } catch (e: any) {
    toast.error(e?.data?.error || 'Gagal menghapus role')
  } finally {
    saving.value = false
  }
}

const goToPermissions = (role: { id: number; name: string }) => {
  // sesuaikan path halaman hak akses kamu
  router.push({ path: '/profile/admin/hak_akses', query: { role: role.id } })
}

onMounted(fetchRoles)
</script>
