<template>
  <v-container class="py-6 bg-grey-lighten-5">
    <v-row justify="center">
      <v-col cols="12" md="12" lg="12">
        <!-- Back Button -->
        <v-btn
          variant="text"
          color="primary"
          @click="goBack"
          class="mb-4"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Kembali ke Daftar
        </v-btn>

        <!-- Profile Card -->
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-h5 font-weight-bold d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-account</v-icon>
              Profil Mahasiswa
            </div>
            <v-chip
              :color="statusColor(student.status)"
              variant="tonal"
              size="medium"
            >
              {{ student.status }}
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Nama Lengkap"
                  :model-value="student.name"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="NIM"
                  :model-value="student.nim"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Email"
                  :model-value="student.email"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Nomor Telepon"
                  :model-value="student.phone"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Program Studi"
                  :model-value="student.study_program"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Fakultas"
                  :model-value="student.faculty"
                  readonly
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <!-- Documents -->
            <v-card elevation="1" class="mt-8 pa-4 rounded-lg">
              <v-card-title class="text-h6">
                <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
                Dokumen Pendukung
              </v-card-title>
              <v-divider class="my-2" />
              <v-list>
                <v-list-item
                  v-for="doc in student.documents"
                  :key="doc.type"
                  :title="getDocumentName(doc.type)"
                >
                  <template #prepend>
                    <v-icon :color="getDocumentIconColor(doc.type)" class="mr-3">
                      {{ getDocumentIcon(doc.type) }}
                    </v-icon>
                  </template>
                  <template #append>
                    <v-btn
                      variant="text"
                      color="primary"
                      :href="doc.path"
                      target="_blank"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Unduh
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Skills -->
            <v-card elevation="1" class="mt-6 pa-4 rounded-lg">
              <v-card-title class="text-h6">
                <v-icon color="primary" class="mr-2">mdi-star</v-icon>
                Keahlian
              </v-card-title>
              <v-divider class="my-2" />
              <v-chip-group>
                <v-chip
                  v-for="skill in student.skills"
                  :key="skill"
                  color="primary"
                  variant="outlined"
                  class="ma-1"
                >
                  {{ skill }}
                </v-chip>
              </v-chip-group>
            </v-card>

            <!-- Portfolio -->
            <v-card v-if="student.portfolio" elevation="1" class="mt-6 pa-4 rounded-lg">
              <v-card-title class="text-h6">
                <v-icon color="primary" class="mr-2">mdi-briefcase</v-icon>
                Portofolio
              </v-card-title>
              <v-divider class="my-2" />
              <div v-html="student.portfolio"></div>
            </v-card>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <template v-if="student.status === 'pending'">
                <v-btn
                color="green"
                variant="tonal"
                @click="acceptStudent"
                :loading="processing"
                >
                <v-icon left>mdi-check</v-icon>
                Terima Mahasiswa
                </v-btn>
                <v-btn
                color="red"
                variant="tonal"
                @click="rejectStudent"
                :loading="processing"
                class="ml-2"
                >
                <v-icon left>mdi-close</v-icon>
                Tolak Mahasiswa
                </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useStudentService } from '@/composables/useDataStudent'
import { useApplicationService } from '@/composables/useApplication'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { getStudentDetail } = useStudentService()
const { processApplication } = useApplicationService()

const student = ref({
  id: '',
  name: '',
  nim: '',
  email: '',
  phone: '',
  study_program: '',
  faculty: '',
  status: 'pending',
  documents: [],
  skills: [],
  portfolio: '',
  image: ''
})

const applicationId = ref(route.query.application || '')
const processing = ref(false)

onMounted(async () => {
  try {
    const { data, error } = await getStudentDetail(route.params.applicant_id)
    if (error.value) throw error.value

    // Deduplicate dokumen berdasarkan type
    const seen = new Set()
    const uniqueDocs = []
    for (const doc of data.value.documents) {
      if (!seen.has(doc.type)) {
        seen.add(doc.type)
        uniqueDocs.push(doc)
      }
    }

    student.value = {
      ...data.value,
      documents: uniqueDocs,
      application_id: applicationId.value
    }
  } catch (error) {
    toast.error('Gagal memuat profil mahasiswa')
    console.error(error)
  }
})

const statusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'accepted': return 'primary'
    case 'confirmed': return 'success'
    case 'rejected': return 'error'
    default: return 'grey'
  }
}

const getDocumentName = (type) => {
  const names = {
    ktp: 'KTP',
    ktm: 'KTM',
    transkrip: 'Transkrip Nilai',
    pernyataan: 'Surat Pernyataan',
    rekomendasi: 'Surat Rekomendasi'
  }
  return names[type] || type
}

const getDocumentIcon = (type) => {
  const icons = {
    ktp: 'mdi-card-account-details',
    ktm: 'mdi-school',
    transkrip: 'mdi-file-document',
    pernyataan: 'mdi-file-sign',
    rekomendasi: 'mdi-account-tie'
  }
  return icons[type] || 'mdi-file'
}

const getDocumentIconColor = (type) => {
  const colors = {
    ktp: 'blue',
    ktm: 'green',
    transkrip: 'purple',
    pernyataan: 'orange',
    rekomendasi: 'teal'
  }
  return colors[type] || 'primary'
}

const acceptStudent = async () => {
  if (!student.value.application_id) return toast.error('Application ID tidak ditemukan')
  processing.value = true
  try {
    await processApplication(student.value.application_id, 'accepted')
    toast.success('Mahasiswa berhasil diterima')
    student.value.status = 'accepted'
  } catch (error) {
    toast.error('Gagal menerima mahasiswa')
  } finally {
    processing.value = false
  }
}

const rejectStudent = async () => {
  if (!student.value.application_id) return toast.error('Application ID tidak ditemukan')
  processing.value = true
  try {
    await processApplication(student.value.application_id, 'rejected')
    toast.success('Mahasiswa berhasil ditolak')
    student.value.status = 'rejected'
  } catch (error) {
    toast.error('Gagal menolak mahasiswa')
  } finally {
    processing.value = false
  }
}

const goBack = () => {
  router.go(-1)
}
</script>
