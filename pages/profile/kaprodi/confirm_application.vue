<template>
  <v-container class="py-8">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-clipboard-text</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Aplikasi Mahasiswa</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Daftar aplikasi studi kasus yang diajukan mahasiswa.
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filter/Search -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Cari mahasiswa atau studi kasus..."
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredApplications"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="36" :color="getRandomColor(item.user.name)">
            <span class="white--text">{{ getInitials(item.user.name) }}</span>
          </v-avatar>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.research_case_title="{ item }">
          <span>{{ item.research_case.title || 'Belum ada judul' }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            color="success"
            variant="tonal"
            class="mr-2"
            @click="handleConfirm(item.id, 'accepted')"
          >
            Terima
          </v-btn>
          <v-btn
            size="small"
            color="error"
            variant="tonal"
            @click="handleConfirm(item.id, 'rejected')"
          >
            Tolak
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'profile' })

import { ref, computed, onMounted } from 'vue'
import { useConfirmApplicationService } from '~/composables/useConfirmApplication'
import { useToast } from 'vue-toastification'

const toast = useToast()

interface Application {
  id: number
  status: string
  applied_at: string
  user: {
    name: string
    email: string
  }
  research_case: {
    title: string
  }
}

const searchQuery = ref('')
const applications = ref<Application[]>([])

const { getApplication, confirmApplication } = useConfirmApplicationService()

onMounted(async () => {
  await loadApplications()
})

const loadApplications = async () => {
  const { data, error } = await getApplication()
  if (error.value) {
    console.error('Gagal mengambil aplikasi mahasiswa:', error.value)
  } else {
    applications.value = data.value?.applications ?? []
  }
}

const handleConfirm = async (id: number, decision: 'accepted' | 'rejected') => {
  const { error } = await confirmApplication(id, decision)
  if (error.value) {
    toast.error('Gagal memproses aplikasi')
  } else {
    toast.success(`Aplikasi berhasil ${decision === 'accepted' ? 'diterima' : 'ditolak'}`)
    await loadApplications()
  }
}

const headers = [
  { title: '', value: 'avatar', sortable: false, width: '50px' },
  { title: 'Nama', value: 'user.name' },
  { title: 'Email', value: 'user.email' },
  { title: 'Studi Kasus', value: 'research_case.title' },
  { title: 'Status Penugasan', value: 'status' },
  { title: 'Waktu Pengajuan', value: 'applied_at' },
  { title: 'Aksi', value: 'actions', sortable: false }
]

const filteredApplications = computed(() =>
  searchQuery.value
    ? applications.value.filter(app =>
        app.user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        app.research_case.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : applications.value
)

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase()

const getRandomColor = (name: string) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  return colors[name.length % colors.length]
}

const statusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'cancelled':
      return 'error'
    case 'pending':
      return 'warning'
    default:
      return 'grey'
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
