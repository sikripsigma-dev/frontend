<template>
  <v-container class="py-6 px-6">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-domain-monitor</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Monitoring Progress Mahasiswa</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              Lihat laporan mingguan mahasiswa dari studi kasus yang Anda ajukan
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Search Filter -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedStudent"
              :items="students"
              item-title="title"
              item-value="value"
              label="Pilih Mahasiswa"
              prepend-icon="mdi-account-school"
              outlined
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedWeek"
              :items="weeks"
              label="Minggu Ke-"
              prepend-icon="mdi-calendar"
              outlined
              dense
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Data Table -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="d-flex align-center">
        <v-icon left>mdi-file-document-multiple</v-icon>
        Laporan Mingguan Mahasiswa
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="Cari..."
          single-line
          hide-details
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredReports"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.student="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="36" class="mr-3">
              <v-img v-if="item.student.avatar" :src="`${config.public.apiBase}${item.student.avatar}`" />
              <span v-else class="white--text text-subtitle-2">{{ item.student.initials }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.student.name }}</div>
              <div class="text-caption text-grey">{{ item.student.nim }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.week="{ item }">
          <v-chip small color="primary" text-color="white">
            Minggu {{ item.week }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="openReportDialog(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Detail & Feedback -->
    <v-dialog v-model="reportDialog" max-width="800" scrollable>
      <v-card v-if="selectedReport">
        <v-card-title class="d-flex justify-space-between">
          <div>
            Laporan Minggu #{{ selectedReport.week }}
            <div class="text-subtitle-1">
              {{ selectedReport.student.name }} • {{ selectedReport.start_date }} - {{ selectedReport.end_date }}
            </div>
          </div>
          <v-btn icon @click="reportDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <h3 class="text-h6 font-weight-medium mb-2">
              <v-icon left>mdi-clipboard-text</v-icon>
              Aktivitas Minggu Ini
            </h3>
            <v-card outlined class="pa-4">
              <p class="text-body-1">{{ selectedReport.activities }}</p>
            </v-card>
          </div>

          <div class="mb-4">
            <h3 class="text-h6 font-weight-medium mb-2">
              <v-icon left>mdi-alert-circle-outline</v-icon>
              Permasalahan
            </h3>
            <v-card outlined class="pa-4">
              <p class="text-body-1">{{ selectedReport.issues }}</p>
            </v-card>
          </div>

          <div class="mb-4">
            <h3 class="text-h6 font-weight-medium mb-2">
              <v-icon left>mdi-lightbulb-on-outline</v-icon>
              Harapan & Saran
            </h3>
            <v-card outlined class="pa-4">
              <p class="text-body-1">{{ selectedReport.hopes }}</p>
            </v-card>
          </div>

          <div class="mt-6">
            <h3 class="text-h6 font-weight-medium mb-2">
              <v-icon left>mdi-comment-check-outline</v-icon>
              Feedback Perusahaan
            </h3>
            <v-form ref="feedbackForm">
              <v-textarea
                v-model="companyFeedback.feedback"
                label="Tuliskan feedback Anda"
                rows="3"
                outlined
                required
              />
              <!-- <v-select
                v-model="companyFeedback.status"
                :items="['Disetujui', 'Perlu Revisi']"
                label="Status"
                outlined
                class="mt-3"
                required
              /> -->
              <v-btn class="mt-4" color="primary" @click="submitCompanyFeedbackHandler">
                Kirim Feedback
              </v-btn>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useMonitoringProgressService } from '@/composables/useMonitoringProgress'
import { useWeeklyReportService } from '@/composables/useWeeklyReport'

definePageMeta({
  layout: 'profile',
  title: 'Monitoring Perkembangan Mahasiswa',
})

const config = useRuntimeConfig()
const toast = useToast()
const { getReportsByCompany } = useWeeklyReportService()
const { submitCompanyFeedback } = useMonitoringProgressService()

const selectedStudent = ref(null)
const selectedWeek = ref(null)
const searchQuery = ref('')
const reportDialog = ref(false)
const selectedReport = ref(null)
const reports = ref([])
const students = ref([])

const feedbackForm = ref(null)
const companyFeedback = ref({
  feedback: '',
  // status: '',
})

const weeks = Array.from({ length: 16 }, (_, i) => ({ title: `Minggu ${i + 1}`, value: i + 1 }))

const headers = [
  { title: 'Mahasiswa', value: 'student', sortable: false },
  { title: 'Studi Kasus', value: 'research_case_title' },
  { title: 'Minggu', value: 'week', align: 'center' },
  { title: 'Tanggal', value: 'start_date' },
  { title: 'Aksi', value: 'actions', align: 'center', sortable: false },
]

const filteredReports = computed(() => {
  let result = [...reports.value]
  if (selectedStudent.value) {
    result = result.filter(r => r.student?.nim === selectedStudent.value)
  }
  if (selectedWeek.value) {
    result = result.filter(r => r.week === selectedWeek.value)
  }
  return result
})

const openReportDialog = (report) => {
  selectedReport.value = report
  companyFeedback.value = {
    feedback: report.company_feedback ?? '',
    // status: report.company_status ?? '',
  }
  reportDialog.value = true
}

const submitCompanyFeedbackHandler = async () => {
  if (!feedbackForm.value?.validate()) return

  const payload = {
    weekly_report_id: selectedReport.value.id,
    feedback: companyFeedback.value.feedback,
    // status: companyFeedback.value.status,
  }

  const { error } = await submitCompanyFeedback(payload)

  if (error.value) {
    toast.error('Gagal mengirim feedback!')
    console.error(error.value)
  } else {
    toast.success('Feedback berhasil dikirim')
    reportDialog.value = false
    loadReports()
  }
}

const loadReports = async () => {
  const { data, error } = await getReportsByCompany()
  if (error.value) {
    toast.error('Gagal memuat laporan!')
    console.error(error.value)
    return
  }

  const rawReports = data.value?.data || []
  reports.value = rawReports

  const uniqueStudents = [...new Map(rawReports.map(r => [
    r.student?.nim,
    { title: `${r.student?.name} (${r.student?.nim})`, value: r.student?.nim }
  ])).values()]

  students.value = uniqueStudents
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease;
}
.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
