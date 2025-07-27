<template>
  <v-container class="py-8">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-account-school</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Daftar Mahasiswa Bimbingan</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Lihat dan pantau mahasiswa yang sedang Anda bimbing.
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
              label="Cari mahasiswa..."
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
        :items="filteredStudents"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="36" :color="item.avatar ? '' : getRandomColor(item.name)">
            <v-img v-if="item.avatar" :src="item.avatar" alt="Avatar" />
            <span v-else class="white--text">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'active' ? 'success' : 'grey'" dark>
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.research_case_title="{ item }">
          <span>{{ item.research_case_title || 'Belum mengambil studi kasus' }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>

definePageMeta({ layout: 'profile' })

import { ref, computed, onMounted } from 'vue'
import { useStudentService } from '~/composables/useDataStudent'

const searchQuery = ref('')
const students = ref([])

const { getStudentsBySupervisor } = useStudentService()

onMounted(async () => {
  const { data, error } = await getStudentsBySupervisor()
  if (error.value) {
    console.error('Gagal mengambil data mahasiswa:', error.value)
  } else {
    students.value = data.value.students
  }
})

const headers = [
  { title: '', value: 'avatar', sortable: false, width: '50px' },
  { title: 'Nama', value: 'name' },
  { title: 'NIM', value: 'nim' },
  { title: 'Email', value: 'email' },
  { title: 'Studi Kasus', value: 'research_case_title' }
]

const filteredStudents = computed(() =>
  searchQuery.value
    ? students.value.filter(s =>
        s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : students.value
)

const getInitials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase()

const getRandomColor = name => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  return colors[name.length % colors.length]
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
