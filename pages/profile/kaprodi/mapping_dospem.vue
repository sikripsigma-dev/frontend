<template>
  <v-container>
    <h2 class="text-h5 mb-4">Daftar Mahasiswa</h2>

    <v-skeleton-loader v-if="pending" type="table" class="mb-3" />

    <v-alert v-else-if="error" type="error">
      Gagal memuat data mahasiswa: {{ error.message }}
    </v-alert>

    <template v-else>
      <v-alert v-if="!students.length" type="info">
        Tidak ada data mahasiswa yang ditemukan.
      </v-alert>

      <v-card v-else>
        <v-data-table
          :headers="headers"
          :items="students"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.avatar="{ item }">
            <v-avatar size="40">
              <v-img :src="item.avatar || 'https://cdn.vuetifyjs.com/images/john.png'" />
            </v-avatar>
          </template>

          <template v-slot:item.research_case_title="{ item }">
            <strong>{{ item.research_case_title || '-' }}</strong>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              @click="openDospemDialog(item)"
            >
              Pilih Dospem
            </v-btn>
          </template>

          <template v-slot:no-data>
            Tidak ada data mahasiswa yang tersedia
          </template>
        </v-data-table>
      </v-card>
    </template>

    <!-- Dialog Pilih Dospem -->
    <v-dialog v-model="showDospemDialog" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Pilih Dosen Pembimbing</span>
        </v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item
              v-for="(dospem, index) in dospemList"
              :key="index"
              @click="selectDospem(dospem)"
              class="hover:bg-grey-lighten-3"
              style="cursor: pointer"
            >
              <v-list-item-title>{{ dospem.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDospemDialog = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudentService } from '~/composables/useStudent'
import axios from 'axios'
import { useRuntimeConfig } from '#app'
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'profile',
})

const config = useRuntimeConfig()

const { data, pending, error } = useStudentService().getStudentUniversity()
const students = computed(() => data.value?.data || [])

const toast = useToast()

const headers = [
  {
    title: 'Foto',
    key: 'avatar',
    sortable: false,
    align: 'center',
    width: '80px',
  },
  {
    title: 'Nama',
    key: 'name',
    value: (item: any) => `${item.name} (${item.nim})`,
  },
  { title: 'Email', key: 'email' },
  { title: 'Judul Studi Kasus', key: 'research_case_title', width: '300px' },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center', width: '150px' },
]

// Modal dospem
const showDospemDialog = ref(false)
const selectedStudent = ref<any>(null)

// List dospem (hardcoded with ID)
const dospemList = ref([
  { id: '337637637dgy3gddh3jd3hd7q3hdiqhdj', name: 'Vestia Zeta' },
//   { id: 'dsp-2', name: 'Prof. Rina Handayani, M.T.' },
//   { id: 'dsp-3', name: 'Dodi Hidayat, M.Kom.' },
//   { id: 'dsp-4', name: 'Elisa Nuraini, Ph.D.' },
])

const openDospemDialog = (student: any) => {
  selectedStudent.value = student
  showDospemDialog.value = true
}

const selectDospem = async (dospem: { id: string; name: string }) => {
  showDospemDialog.value = false

  try {
    const res = await axios.put(
      `${config.public.apiBase}/api/student/assign-supervisor`,
      {
        student_id: selectedStudent.value.id,
        supervisor_id: dospem.id,
      },
      {
        withCredentials: true,
      }
    )

    console.log('Success:', res.data.message)
    // alert(`Dospem "${dospem.name}" berhasil di-assign ke ${selectedStudent.value.name}`)
    toast.success(`Dospem "${dospem.name}" berhasil di-assign ke ${selectedStudent.value.name}`)
  } catch (err: any) {
    console.error(err)
    // alert('Gagal assign dospem')
    toast.error('Gagal assign dospem: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
