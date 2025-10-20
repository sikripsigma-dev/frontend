<template>
  <v-container class="py-6">
    <v-row justify="center">
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-3">mdi-calendar-week</v-icon>
            <div>
              <h1 class="text-h4 font-weight-bold text-grey-darken-4">Laporan Mingguan</h1>
              <p class="text-subtitle-1 text-grey-darken-1 mb-0">
                Isi perkembangan mingguan Anda untuk dosen pembimbing dan perusahaan
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Studi Kasus Aktif -->
      <v-col cols="12">
        <v-alert
          v-if="assignmentTitle"
          type="info"
          variant="outlined"
          border="start"
          color="primary"
          icon="mdi-lightbulb-on"
          class="mb-6"
        >
          <strong>Studi Kasus Aktif:</strong> {{ assignmentTitle }}
        </v-alert>

        <v-alert
          v-else
          type="warning"
          variant="outlined"
          border="start"
          color="warning"
          icon="mdi-alert-circle"
          class="mb-6"
        >
          Belum ada studi kasus aktif. Anda belum bisa mengisi laporan mingguan.
        </v-alert>
      </v-col>

      <!-- Form -->
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="mb-6">
          <v-tabs v-model="activeTab" background-color="primary" dark>
            <v-tab value="dospem">Untuk Dosen Pembimbing</v-tab>
            <v-tab value="perusahaan">Untuk Perusahaan</v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Form untuk Dosen -->
            <v-window-item value="dospem">
              <v-form ref="formRef" @submit.prevent="submit" :disabled="!assignmentTitle">
                <v-card-text class="pa-6">
                  <v-select v-model="sharedWeek" :items="weeks" label="Minggu Ke-" outlined required prepend-icon="mdi-calendar" />
                  <v-textarea v-model="form.progress" outlined label="Apa yang sudah Anda capai minggu ini?" rows="5" required prepend-icon="mdi-text-box" />
                  <div class="mb-4">
                    <div class="text-body-1 mb-2">
                      <v-icon left>mdi-emoticon-outline</v-icon>
                      Bagaimana perasaan Anda minggu ini?
                    </div>
                    <div class="d-flex justify-space-between">
                      <v-btn
                        v-for="(mood, index) in moods"
                        :key="index"
                        :color="form.mood === index ? mood.color : 'grey lighten-3'"
                        depressed fab small @click="form.mood = index"
                      >
                        <v-icon :color="form.mood === index ? 'white' : mood.iconColor">
                          {{ mood.icon }}
                        </v-icon>
                      </v-btn>
                    </div>
                    <div class="d-flex justify-space-between mt-1">
                      <span
                        v-for="(mood, index) in moods"
                        :key="index"
                        class="text-caption text-center"
                        :class="{ 'font-weight-bold': form.mood === index }"
                        style="width: 40px;"
                      >
                        {{ mood.label }}
                      </span>
                    </div>
                  </div>
                  <v-textarea v-model="form.notes" outlined label="Catatan Tambahan" rows="2" prepend-icon="mdi-note" />
                  <v-file-input v-model="form.files" multiple prepend-icon="mdi-paperclip" label="Lampiran File" show-size :rules="fileRules" />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-4">
                  <v-btn color="grey lighten-1" text @click="reset">Reset</v-btn>
                  <v-spacer />
                  <v-btn color="primary" type="submit" :loading="submitting" :disabled="!assignmentTitle" depressed>
                    <v-icon left>mdi-send</v-icon>
                    Kirim Laporan
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-window-item>

            <!-- Form untuk Perusahaan -->
            <v-window-item value="perusahaan">
              <v-form>
                <v-card-text class="pa-6">
                  <v-select v-model="sharedWeek" :items="weeks" label="Minggu Ke-" outlined required prepend-icon="mdi-calendar" />
                  <v-textarea v-model="companyForm.activities" label="Progress Anda minggu ini dalam pengerjaan studi kasus perusahaan" outlined rows="4" prepend-icon="mdi-briefcase-check" required />
                  <v-textarea v-model="companyForm.notes" label="Catatan tambahan" outlined rows="2" prepend-icon="mdi-note-text" />
                  <v-file-input v-model="companyForm.files" multiple prepend-icon="mdi-paperclip" label="Lampiran File (opsional)" show-size />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-4">
                  <v-btn color="grey lighten-1" text @click="resetCompany">Reset</v-btn>
                  <v-spacer />
                  <v-btn color="success" type="button" :disabled="!assignmentTitle || submitting" depressed @click="submitCompany()">
                    <v-icon left>mdi-send</v-icon>
                    Kirim Laporan
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-window-item>
          </v-window>
        </v-card>

        <!-- Log Laporan -->
        <v-card elevation="2" rounded="lg">
          <v-card-title class="text-h5">
            <v-icon left>mdi-history</v-icon>
            Log Laporan
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="activeTab === 'dospem' ? reportHeaders : companyReportHeaders"
              :items="previousReports"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.mood="{ item }" v-if="activeTab === 'dospem'">
                <v-icon :color="moods[item.mood]?.color">
                  {{ moods[item.mood]?.icon }}
                </v-icon>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item)" small>
                  {{ item.status }}
                  <v-tooltip v-if="item.has_feedback && activeTab === 'dospem'" activator="parent" location="top">
                    Sudah ada feedback
                  </v-tooltip>
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon small @click="viewReport(item)">
                  <v-icon small>mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Certificate Section -->
        <!-- <v-card elevation="2" rounded="lg" class="mt-6">
          <v-card-title class="text-h5">
            <v-icon left>mdi-certificate</v-icon>
            Sertifikat Penyelesaian
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="assignmentStatus === 'completed'"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              Anda telah menyelesaikan studi kasus ini. Silakan unduh sertifikat penyelesaian.
            </v-alert>
            <v-alert
              v-else
              type="warning"
              variant="tonal"
              class="mb-4"
            >
              Sertifikat akan tersedia setelah Anda menyelesaikan studi kasus dan dosen mengkonfirmasi penyelesaian.
            </v-alert>
            
            <v-btn
              color="primary"
              :disabled="!canGenerateCertificate"
              @click="generateCertificate"
              :loading="generatingCertificate"
            >
              <template v-slot:loader>
                <v-progress-circular indeterminate size="24"></v-progress-circular>
              </template>
              <v-icon left>mdi-download</v-icon>
              Unduh Sertifikat
            </v-btn>

            <v-alert
              v-if="certificateError"
              type="error"
              class="mt-4"
            >
              {{ certificateError }}
            </v-alert>
          </v-card-text>
        </v-card> -->
      </v-col>
    </v-row>

    <!-- Feedback Dialog -->
    <v-dialog v-model="feedbackDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon left>mdi-comment-text</v-icon>
          {{ activeTab === 'dospem' ? 'Feedback Dosen Pembimbing' : 'Catatan Perusahaan' }}
        </v-card-title>
        <v-card-text>
          <v-alert v-if="feedbackLoading" type="info" class="mb-4">
            Memuat feedback...
          </v-alert>
          
          <template v-if="currentFeedback">
            <div class="mb-4">
              <strong>Minggu Ke-:</strong> {{ currentFeedback.WeeklyReport?.week || selectedReport?.week || '-' }}
            </div>
            <div class="mb-4">
              <strong>Status:</strong> 
              <v-chip :color="currentFeedback.status === 'Diterima' ? 'success' : 'warning'" small class="ml-2">
                {{ currentFeedback.status }}
              </v-chip>
            </div>
            <div class="mb-4">
              <strong>Tanggal {{ activeTab === 'dospem' ? 'Feedback' : 'Laporan' }}:</strong> 
              {{ formatDate(currentFeedback.created_at) }}
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="text-body-1">
              <strong>{{ activeTab === 'dospem' ? 'Feedback' : 'Catatan' }}:</strong>
              <p class="mt-2" style="white-space: pre-line;">{{ currentFeedback.feedback || currentFeedback.notes || 'Tidak ada feedback' }}</p>
            </div>
          </template>
          
          <v-alert v-else-if="!feedbackLoading" type="warning">
            Belum ada feedback untuk laporan ini
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="feedbackDialog = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useWeeklyReportService } from '@/composables/useWeeklyReport'
import { useAssignmentService } from '@/composables/useAssignment'

definePageMeta({
  layout: 'profile',
  title: 'Laporan Perkembangan Mingguan',
})

const toast = useToast()
const { submitReport, getMyReports, submitCompanyReport, getSupervisorFeedback } = useWeeklyReportService()
const { getMyAssignment, generateCertificate: generateCertificateApi } = useAssignmentService()

// State
const activeTab = ref('dospem')
const formRef = ref()
const submitting = ref(false)
const assignmentTitle = ref('')
const researchCaseId = ref('')
const sharedWeek = ref(null)
const feedbackDialog = ref(false)
const currentFeedback = ref(null)
const feedbackLoading = ref(false)
const selectedReport = ref(null)
const generatingCertificate = ref(false)
const certificateError = ref('')
const assignmentStatus = ref('')
const assignmentEndedAt = ref(null)

// Data
const weeks = Array.from({ length: 16 }, (_, i) => i + 1)

const form = ref({
  progress: '',
  mood: 2,
  notes: '',
  files: []
})

const companyForm = ref({
  activities: '',
  notes: '',
  files: []
})

const fileRules = [
  value => !value || value.length <= 3 || 'Maksimal 3 file yang diunggah'
]

const moods = [
  { icon: 'mdi-emoticon-sad', label: 'Buruk', color: 'red', iconColor: 'red darken-1' },
  { icon: 'mdi-emoticon-neutral', label: 'Biasa', color: 'orange', iconColor: 'orange darken-1' },
  { icon: 'mdi-emoticon-happy', label: 'Baik', color: 'light-green', iconColor: 'light-green darken-1' },
  { icon: 'mdi-emoticon-excited', label: 'Sangat Baik', color: 'green', iconColor: 'green darken-1' },
  { icon: 'mdi-emoticon-cool', label: 'Luar Biasa', color: 'teal', iconColor: 'teal darken-1' }
]

const reportHeaders = [
  { title: 'Minggu Ke-', value: 'week' },
  { title: 'Tanggal', value: 'date' },
  { title: 'Perasaan', value: 'mood' },
  { title: 'Status', value: 'status' },
  { title: 'Aksi', value: 'actions', sortable: false }
]

const companyReportHeaders = [
  { title: 'Minggu Ke-', value: 'week' },
  { title: 'Tanggal', value: 'date' },
  { title: 'Aktivitas', value: 'activities' },
  { title: 'Status', value: 'status' },
  { title: 'Aksi', value: 'actions', sortable: false }
]

const previousReports = ref([])

// Computed
// const canGenerateCertificate = computed(() => {
//   return assignmentStatus.value === 'completed' && assignmentEndedAt.value
// })

const canGenerateCertificate = computed(() => {
  console.log('Checking certificate conditions:',
    'Status:', assignmentStatus.value,
    'EndedAt:', assignmentEndedAt.value
  )
  return assignmentStatus.value === 'completed' && assignmentEndedAt.value
})

const dateRangeDisplay = computed(() => {
  if (!sharedWeek.value) return ''
  const start = new Date(2023, 1, 12)
  start.setDate(start.getDate() + (sharedWeek.value - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
})

// Methods
const getISODateRange = () => {
  const start = new Date(2023, 1, 12)
  start.setDate(start.getDate() + (sharedWeek.value - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

// const fetchActiveAssignment = async () => {
//   const { data } = await getMyAssignment()
//   if (data.value) {
//     assignmentTitle.value = data.value.data.research_case.title
//     researchCaseId.value = data.value.data.research_case.id
//     assignmentStatus.value = data.value.data.status
//     assignmentEndedAt.value = data.value.data.ended_at
//   }
// }

const fetchActiveAssignment = async () => {
  try {
    const { data, error } = await getMyAssignment()
    if (data.value) {
      assignmentTitle.value = data.value.data.research_case.title
      researchCaseId.value = data.value.data.research_case.id
      assignmentStatus.value = data.value.data.status
      assignmentEndedAt.value = data.value.data.ended_at
      
      // Debugging
      console.log('Assignment Status:', assignmentStatus.value)
      console.log('Ended At:', assignmentEndedAt.value)
    } else if (error.value) {
      console.error('Error fetching assignment:', error.value)
    }
  } catch (err) {
    console.error('Failed to fetch assignment:', err)
  }
}

const generateCertificate = async () => {
  if (!canGenerateCertificate.value) {
    toast.error('Anda harus menyelesaikan studi kasus terlebih dahulu')
    return
  }

  generatingCertificate.value = true
  certificateError.value = ''
  
  try {
    const { data, error } = await generateCertificateApi()
    
    if (error.value) {
      throw new Error(error.value.message || 'Gagal mengunduh sertifikat')
    }

    if (!data.value) {
      throw new Error('Tidak ada data sertifikat yang diterima')
    }

    // Create download link
    const blob = new Blob([data.value], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Generate filename based on assignment title and current date
    const filename = `Sertifikat_${assignmentTitle.value.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    link.setAttribute('download', filename)
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (err) {
    console.error('Certificate download error:', err)
    certificateError.value = err.message || 'Terjadi kesalahan saat mengunduh sertifikat'
    toast.error(certificateError.value)
  } finally {
    generatingCertificate.value = false
  }
}

const submit = async () => {
  if (!sharedWeek.value) {
    toast.error('Silakan pilih minggu terlebih dahulu.')
    return
  }

  submitting.value = true

  const formData = new FormData()
  formData.append('week', sharedWeek.value)
  formData.append('progress', form.value.progress)
  formData.append('mood', form.value.mood)
  formData.append('notes', form.value.notes)
  formData.append('research_case_id', researchCaseId.value)

  const { start_date, end_date } = getISODateRange()
  formData.append('start_date', start_date)
  formData.append('end_date', end_date)

  form.value.files.forEach(file => {
    formData.append('files', file)
  })

  try {
    const { error } = await submitReport(formData)
    if (error.value) throw error.value
    toast.success('Laporan berhasil dikirim!')
    reset()
    await loadReports('dosen')
  } catch (e) {
    toast.error('Gagal mengirim laporan')
  } finally {
    submitting.value = false
  }
}

const submitCompany = async () => {
  if (!sharedWeek.value) {
    toast.error('Silakan pilih minggu terlebih dahulu.')
    return
  }

  submitting.value = true

  const formData = new FormData()
  formData.append('week', sharedWeek.value)
  formData.append('activities', companyForm.value.activities)
  formData.append('notes', companyForm.value.notes)
  formData.append('research_case_id', researchCaseId.value)

  const { start_date, end_date } = getISODateRange()
  formData.append('start_date', start_date)
  formData.append('end_date', end_date)

  companyForm.value.files.forEach(file => {
    formData.append('files', file)
  })

  try {
    const { error } = await submitCompanyReport(formData)
    if (error.value) throw error.value
    toast.success('Laporan perusahaan berhasil dikirim!')
    resetCompany()
    await loadReports('perusahaan')
  } catch (e) {
    toast.error('Gagal mengirim laporan perusahaan')
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  form.value = {
    progress: '',
    mood: 2,
    notes: '',
    files: []
  }
  sharedWeek.value = null
}

const resetCompany = () => {
  companyForm.value = {
    activities: '',
    notes: '',
    files: []
  }
  sharedWeek.value = null
}

const loadReports = async (type = 'dosen') => {
  const { data, error } = await getMyReports(type)
  if (data.value) {
    previousReports.value = data.value.data.map(r => ({
      ...r,
      date: `${r.start_date} - ${r.end_date}`,
      has_feedback: r.has_feedback || false
    }))
  } else if (error.value) {
    toast.error('Gagal memuat laporan')
  }
}

const viewReport = async (report) => {
  selectedReport.value = report
  feedbackDialog.value = true
  currentFeedback.value = null
  
  if (activeTab.value === 'dospem') {
    feedbackLoading.value = true
    try {
      const { data, error } = await getSupervisorFeedback(report.id)
      if (data.value && data.value.feedbacks && data.value.feedbacks.length > 0) {
        currentFeedback.value = data.value.feedbacks[0]
      }
    } catch (e) {
      toast.error('Gagal memuat feedback')
    } finally {
      feedbackLoading.value = false
    }
  } else {
    // Handle company report viewing
    currentFeedback.value = {
      status: report.status,
      created_at: report.created_at,
      feedback: report.notes || 'Tidak ada catatan dari perusahaan',
      WeeklyReport: { week: report.week }
    }
  }
}

const getStatusColor = (item) => {
  if (item.status === 'Diterima') return 'success'
  if (item.has_feedback && activeTab.value === 'dospem') return 'info'
  return 'warning'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for tab changes to load appropriate reports
watch(activeTab, (newTab) => {
  if (newTab === 'dospem') {
    loadReports('supervisor')
  } else if (newTab === 'perusahaan') {
    loadReports('company')
  }
})

// Lifecycle
onMounted(() => {
  fetchActiveAssignment()
  loadReports('supervisor') // Load dosen reports by default
})
</script>