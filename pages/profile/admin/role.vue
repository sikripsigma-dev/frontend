<template>
  <v-container class="py-8">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Manajemen Role</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Kelola dan atur role pengguna dalam sistem</p>
      </div>
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon>
        Tambah Role
      </v-btn>
    </div>

    <!-- Role List -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="roles"
        class="elevation-1"
        item-value="name"
        items-per-page="5"
      >
        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Edit">
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click="editRole(item)">
                <v-icon color="primary">mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Kelola Akses">
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click="goToPermissions(item)">
                <v-icon color="success">mdi-shield-key</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Hapus">
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click="confirmDelete(item)">
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="roleDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editingRole ? 'Edit Role' : 'Tambah Role Baru' }}</span>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="roleForm.name"
            label="Nama Role"
            outlined
            :rules="[v => !!v || 'Nama role wajib diisi']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Batal</v-btn>
          <v-btn color="primary" @click="saveRole">{{ editingRole ? 'Simpan' : 'Tambah' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus role <strong>{{ selectedRole?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" @click="deleteRole">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const roles = ref([
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Student' },
  { id: 3, name: 'Perusahaan' },
  { id: 4, name: 'Dosen Pembimbing' }
])

const headers = [
  { title: 'Nama Role', value: 'name' },
  { title: 'Aksi', value: 'actions', align: 'center', sortable: false }
]

const roleDialog = ref(false)
const deleteDialog = ref(false)
const editingRole = ref(null)
const selectedRole = ref(null)

const roleForm = ref({
  name: ''
})

const openAddDialog = () => {
  editingRole.value = null
  roleForm.value = { name: '' }
  roleDialog.value = true
}

const editRole = (role) => {
  editingRole.value = role
  roleForm.value = { ...role }
  roleDialog.value = true
}

const closeDialog = () => {
  roleDialog.value = false
}

const saveRole = () => {
  if (!roleForm.value.name) return

  if (editingRole.value) {
    const idx = roles.value.findIndex(r => r.id === editingRole.value.id)
    if (idx !== -1) roles.value[idx].name = roleForm.value.name
  } else {
    const newRole = {
      id: Math.max(...roles.value.map(r => r.id)) + 1,
      name: roleForm.value.name
    }
    roles.value.push(newRole)
  }

  roleDialog.value = false
}

const confirmDelete = (role) => {
  selectedRole.value = role
  deleteDialog.value = true
}

const deleteRole = () => {
  roles.value = roles.value.filter(r => r.id !== selectedRole.value.id)
  deleteDialog.value = false
}

const goToPermissions = (role) => {
  alert(`Navigasi ke halaman hak akses untuk: ${role.name}`)
  // bisa diganti dengan router.push(`/roles/${role.id}/permissions`)
}
</script>
