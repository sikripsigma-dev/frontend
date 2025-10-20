<template>
  <v-container class="py-8">
    <!-- Header -->
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
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify"
              label="Search users..." outlined dense hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="roleFilter" :items="roleOptions" label="Filter by role"
              outlined dense clearable hide-details />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-0"
      >
        <template #item.avatar="{ item }">
          <v-avatar size="36" :color="item.avatar ? '' : getRandomColor(item.name)">
            <v-img v-if="item.avatar" :src="item.avatar" />
            <span v-else class="white--text">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <template #item.status="{ item }">
          <v-chip small :color="getStatusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>

        <template #item.role="{ item }">
          <v-chip small :color="getRoleColor(item.role)" text-color="white">{{ item.role }}</v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn icon small v-on="on" @click="openEditUserDialog(item)">
                <v-icon small color="primary">mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit User</span>
          </v-tooltip>
        </template>

        <template #no-data>
          <v-alert type="info" border="start" variant="tonal" class="ma-4">
            Belum ada pengguna.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit User Dialog -->
    <v-dialog v-model="userDialog" max-width="520">
      <v-card>
        <v-card-title>
          Edit User
          <v-spacer />
          <v-btn icon @click="userDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="userFormRef">
            <v-text-field v-model="userForm.name" label="Name" outlined :rules="[required]" />
            <v-text-field v-model="userForm.email" label="Email" outlined :rules="[required, emailRule]" />
            <v-text-field v-model="userForm.phone" label="Phone" outlined :rules="[required]" />
            <v-select v-model="userForm.status" :items="statusOptions" label="Status" outlined :rules="[required]" />

            <v-alert type="info" variant="tonal" class="mt-4" v-if="editingUser?.role">
              Role: <b>{{ editingUser.role }}</b>
            </v-alert>

            <!-- Field khusus Kaprodi -->
            <template v-if="isKaprodi">
              <v-divider class="my-4" />
              <v-select
                v-model="userForm.university_id"
                :items="universities"
                item-title="name"
                item-value="id"
                label="Universitas (wajib)"
                outlined
                :loading="loadingMasters"
                :rules="[required]"
                clearable
              />
              <v-select
                v-model="userForm.study_program_id"
                :items="prodis"
                item-title="name"
                item-value="id"
                label="Program Studi (wajib)"
                outlined
                :loading="loadingMasters"
                :rules="[required]"
                clearable
              />
              <v-text-field v-model="userForm.nidn" label="NIDN (opsional)" outlined />
            </template>
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

<script setup lang="ts">
definePageMeta({ layout: 'profile' })

import { onMounted, ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useUserManagement } from '~/composables/useUserManagement'
import { useDataProdi } from '~/composables/useDataProdi'
import { useDataUniversity } from '~/composables/useDataUniversity'

const toast = useToast()

// table state
const users = ref<any[]>([])
const searchQuery = ref('')
const roleFilter = ref<string|null>(null)

const roleOptions = ['Super Admin', 'Admin', 'Perusahaan', 'Dosen Pembimbing', 'Mahasiswa', 'Kaprodi']
const statusOptions = ['active', 'inactive', 'pending'] // samakan dg BE

const headers = [
  { title: '', value: 'avatar', width: '50px', sortable: false },
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Role', value: 'role', align: 'center' },
  { title: 'Status', value: 'status', align: 'center' },
  { title: 'Last Active', value: 'lastActive' },
  { title: 'Actions', value: 'actions', align: 'center', sortable: false }
]

// composables
const { getAllUsers, getUserDetail, updateUser } = useUserManagement()
const { prodis, getProdis, pending: prodiPending } = useDataProdi()
const { universities, getUniversities, pending: univPending } = useDataUniversity()

// dialog state
const userDialog = ref(false)
const editingUser = ref<any|null>(null)
const userFormRef = ref()

const userForm = ref<any>({
  name: '',
  email: '',
  phone: '',
  status: '',
  university_id: '',
  study_program_id: '',
  nidn: ''
})

const required = (v:any) => !!v || 'Required'
const emailRule = (v:any) => /.+@.+\..+/.test(v) || 'E-mail must be valid'

const isKaprodi = computed(() =>
  editingUser.value?.role === 'Kaprodi' || editingUser.value?.role_id === 5
)

const loadingMasters = computed(() => prodiPending.value || univPending.value)

const openEditUserDialog = async (user:any) => {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    status: (user.status || 'active').toLowerCase(),
    university_id: '',
    study_program_id: '',
    nidn: ''
  }

  // muat master + prefill headstudy bila Kaprodi
  if (isKaprodi.value) {
    try {
      await Promise.all([ getUniversities(), getProdis() ])

      const { data, error } = await getUserDetail(user.id)
      if (error.value) throw error.value
      const detail = data.value?.user || data.value
      const hs = detail?.Headstudy || detail?.headstudy
      if (hs) {
        userForm.value.university_id   = hs.UniversityID   || hs.university_id   || hs.University?.ID
        userForm.value.study_program_id= hs.StudyProgramID || hs.study_program_id|| hs.StudyProgram?.ID
        userForm.value.nidn            = hs.Nidn           || hs.nidn || ''
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat data Kaprodi / master')
    }
  }

  userDialog.value = true
}

const saveUser = async () => {
  if (!editingUser.value) return
  const ok = await userFormRef.value?.validate?.()
  if (ok === false) return

  const payload:any = {
    name: userForm.value.name,
    email: userForm.value.email,
    phone: userForm.value.phone,
    status: userForm.value.status
  }

  if (isKaprodi.value) {
    if (!userForm.value.university_id || !userForm.value.study_program_id) {
      toast.error('Kaprodi wajib memilih Universitas dan Program Studi')
      return
    }
    payload.university_id   = userForm.value.university_id
    payload.study_program_id= userForm.value.study_program_id
    if (userForm.value.nidn) payload.nidn = userForm.value.nidn
  }

  const { error } = await updateUser(editingUser.value.id, payload)
  if (error.value) {
    console.error('Update failed:', error.value)
    toast.error(error.value?.data?.error || 'Gagal memperbarui user')
    return
  }

  // reflect ke list
  const idx = users.value.findIndex(u => u.id === editingUser.value.id)
  if (idx !== -1) {
    users.value[idx] = {
      ...users.value[idx],
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      status: payload.status
    }
  }

  toast.success(`Berhasil memperbarui data pengguna: ${payload.name}`)
  userDialog.value = false
}

onMounted(async () => {
  const { data, error } = await getAllUsers()
  if (error.value) {
    console.error('Failed to fetch users:', error.value)
    return
  }
  users.value = (data.value.users || data.value || []).map((user:any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: mapRoleIdToName(user.role || user.role_id),
    role_id: user.role || user.role_id,
    status: (user.status || 'active'),
    lastActive: '—',
    avatar: user.image || ''
  }))
})

const filteredUsers = computed(() =>
  roleFilter.value ? users.value.filter(u => u.role === roleFilter.value) : users.value
)

const getInitials = (name:string) => name.split(' ').map(n => n[0]).join('').toUpperCase()
const getRandomColor = (name:string) => {
  const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
  return colors[name.length % colors.length]
}
const getStatusColor = (status:string) => {
  switch ((status || '').toLowerCase()) {
    case 'active': return 'success'
    case 'inactive': return 'grey'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}
const getRoleColor = (role:string) => {
  switch (role) {
    case 'Mahasiswa': return 'primary'
    case 'Dosen Pembimbing': return 'secondary'
    case 'Perusahaan': return 'success'
    case 'Admin': return 'info'
    case 'Super Admin': return 'error'
    case 'Kaprodi': return 'warning'
    default: return 'grey'
  }
}
const mapRoleIdToName = (roleId:number) => {
  switch (roleId) {
    case 1: return 'Admin'
    case 2: return 'Perusahaan'
    case 3: return 'Mahasiswa'
    case 4: return 'Dosen Pembimbing'
    case 5: return 'Kaprodi'
    case 99: return 'Super Admin'
    default: return 'Unknown'
  }
}
</script>

<style scoped>
.v-avatar{transition:transform .2s}
.v-avatar:hover{transform:scale(1.1)}
.v-data-table >>> .v-data-table-header{background-color:#f5f5f5}
.v-data-table >>> th{font-weight:600!important}
</style>
