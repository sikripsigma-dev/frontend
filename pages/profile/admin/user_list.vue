<template>
  <v-container class="py-8">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-account-group</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">User Management</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Manage all registered users and their permissions
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Action Bar -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search users..."
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="roleFilter"
              :items="roleOptions"
              label="Filter by role"
              outlined
              dense
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-0"
      >
        <!-- Avatar Column -->
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="36" :color="item.avatar ? '' : getRandomColor(item.name)">
            <v-img v-if="item.avatar" :src="item.avatar" alt="User Avatar"></v-img>
            <span v-else class="white--text">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip small :color="getStatusColor(item.status)" dark>
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Role Column -->
        <template v-slot:item.role="{ item }">
          <v-chip small :color="getRoleColor(item.role)" text-color="white">
            {{ item.role }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="openEditUserDialog(item)">
                <v-icon small color="primary">mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit User</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit User Dialog -->
    <v-dialog v-model="userDialog" max-width="500">
      <v-card>
        <v-card-title>
          Edit User
          <v-spacer />
          <v-btn icon @click="userDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="userFormRef">
            <v-text-field
              v-model="userForm.name"
              label="Name"
              outlined
              :rules="[required]"
            />
            <v-text-field
              v-model="userForm.email"
              label="Email"
              outlined
              :rules="[required, emailRule]"
            />
            <v-text-field
              v-model="userForm.phone"
              label="Phone"
              outlined
              :rules="[required]"
            />
            <v-select
              v-model="userForm.status"
              :items="statusOptions"
              label="Status"
              outlined
              :rules="[required]"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="userDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ layout: 'profile' })

import { onMounted, ref, computed } from 'vue'
import { useUserManagement } from '~/composables/useUserManagement'
import { useToast } from 'vue-toastification'

const users = ref([])
const searchQuery = ref('')
const roleFilter = ref(null)
const toast = useToast()

const roleOptions = ['Super Admin', 'Admin', 'Perusahaan', 'Dosen Pembimbing', 'Mahasiswa']
const statusOptions = ['Active', 'Inactive']

const headers = [
  { title: '', value: 'avatar', width: '50px', sortable: false },
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Role', value: 'role', align: 'center' },
  { title: 'Status', value: 'status', align: 'center' },
  { title: 'Last Active', value: 'lastActive' },
  { title: 'Actions', value: 'actions', align: 'center', sortable: false }
]

const { getAllUsers, updateUser } = useUserManagement()

const userDialog = ref(false)
const editingUser = ref(null)

const userForm = ref({
  name: '',
  email: '',
  phone: '',
  status: ''
})

const required = v => !!v || 'Required'
const emailRule = v => /.+@.+\..+/.test(v) || 'E-mail must be valid'

const openEditUserDialog = (user) => {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    status: user.status || 'Active'
  }
  userDialog.value = true
}

const saveUser = async () => {
  if (!editingUser.value) return

  const formData = new FormData()
  formData.append('name', userForm.value.name)
  formData.append('email', userForm.value.email)
  formData.append('phone', userForm.value.phone)
  formData.append('status', userForm.value.status)

  const { error } = await updateUser(editingUser.value.id, formData)
  if (error.value) {
    console.error('Update failed:', error.value)
  } else {
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userForm.value
      }
    }
    toast.success(`Berhasil memperbarui data pengguna: ${userForm.value.name}`)
    userDialog.value = false
  }
}

onMounted(async () => {
  const { data, error } = await getAllUsers()

  if (error.value) {
    console.error('Failed to fetch users:', error.value)
    return
  }

  users.value = data.value.users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: mapRoleIdToName(user.role_id),
    status: user.status || 'Active',
    lastActive: '—',
    avatar: user.image || ''
  }))
})

const filteredUsers = computed(() => {
  return roleFilter.value
    ? users.value.filter(user => user.role === roleFilter.value)
    : users.value
})

const getInitials = name => name.split(' ').map(n => n[0]).join('').toUpperCase()

const getRandomColor = name => {
  const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
  return colors[name.length % colors.length]
}

const getStatusColor = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'grey'
    case 'Pending': return 'warning'
    default: return 'grey'
  }
}

const getRoleColor = role => {
  switch (role) {
    case 'Mahasiswa': return 'primary'
    case 'Dosen Pembimbing': return 'secondary'
    case 'Perusahaan': return 'success'
    case 'Admin': return 'info'
    case 'Super Admin': return 'error'
    default: return 'grey'
  }
}

const mapRoleIdToName = roleId => {
  switch (roleId) {
    case 1: return 'Admin'
    case 2: return 'Perusahaan'
    case 3: return 'Mahasiswa'
    case 4: return 'Dosen Pembimbing'
    default: return 'Unknown'
  }
}
</script>

<style scoped>
.v-avatar {
  transition: transform 0.2s;
}
.v-avatar:hover {
  transform: scale(1.1);
}
.v-data-table >>> .v-data-table-header {
  background-color: #f5f5f5;
}
.v-data-table >>> th {
  font-weight: 600 !important;
}
</style>
