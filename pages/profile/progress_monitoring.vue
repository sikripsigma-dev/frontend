<template>
  <v-container class="py-6 px-6">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-monitor-dashboard</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Monitoring Perkembangan Mahasiswa</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              Tinjau laporan mingguan dan berikan masukan kepada mahasiswa bimbingan Anda
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filter Controls -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedStudent"
              :items="students"
              item-text="text"
              item-value="value"
              label="Pilih Mahasiswa"
              outlined
              dense
              prepend-icon="mdi-account-school"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedWeek"
              :items="weeks"
              label="Minggu Ke-"
              outlined
              dense
              prepend-icon="mdi-calendar"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Status Laporan"
              outlined
              dense
              prepend-icon="mdi-filter"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3" class="d-flex align-center">
            <v-btn color="primary" @click="applyFilters" class="ml-auto">
              <v-icon left>mdi-magnify</v-icon>
              Terapkan
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Reports Overview -->
    <v-row class="mb-6">
      <v-col cols="12" md="4" v-for="(stat, index) in summaryStats" :key="index">
        <v-card elevation="2" rounded="lg" :color="stat.color" dark>
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar :color="stat.avatarColor" size="56" class="mr-4">
                <v-icon size="30">{{ stat.icon }}</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                <div class="text-subtitle-1">{{ stat.title }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Reports List -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="d-flex align-center">
        <v-icon left>mdi-file-document-multiple</v-icon>
        Daftar Laporan Mingguan
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="Cari laporan..."
          single-line
          hide-details
          style="max-width: 300px;"
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
            <v-img
              v-if="item.student.avatar"
              :src="`${config.public.apiBase}${item.student.avatar}`"
              alt="Avatar"
            />
            <span v-else class="white--text text-subtitle-2">
              {{ item.student.initials }}
            </span>
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

        <template v-slot:item.mood="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" :color="getMoodColor(item.mood)">
                {{ getMoodIcon(item.mood) }}
              </v-icon>
            </template>
            <span>{{ getMoodText(item.mood) }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" small>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            @click="openReportDialog(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="green"
            @click="openFeedbackDialog(item)"
            class="ml-2"
          >
            <v-icon>mdi-comment-text</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Report Detail Dialog -->
    <v-dialog v-model="reportDialog" max-width="800" scrollable>
      <v-card v-if="selectedReport">
        <v-card-title class="d-flex justify-space-between">
          <div>
            Laporan Mingguan #{{ selectedReport.week }}
            <div class="text-subtitle-1">
              {{ selectedReport.student.name }} • {{ selectedReport.dateRange }}
            </div>
          </div>
          <v-btn icon @click="reportDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div class="mb-6">
            <h3 class="text-h6 font-weight-medium mb-3">
              <v-icon left>mdi-progress-check</v-icon>
              Pencapaian Minggu Ini
            </h3>
            <v-card outlined class="pa-4">
              <p class="text-body-1">{{ selectedReport.progress }}</p>
            </v-card>
          </div>

          <div class="mb-6">
            <h3 class="text-h6 font-weight-medium mb-3">
              <v-icon left>mdi-calendar-arrow-right</v-icon>
              Rencana Minggu Depan
            </h3>
            <v-card outlined class="pa-4">
              <p class="text-body-1">{{ selectedReport.nextWeekPlan }}</p>
            </v-card>
          </div>

          <div>
            <h3 class="text-h6 font-weight-medium mb-3">
              <v-icon left>mdi-emoticon-outline</v-icon>
              Kondisi Mahasiswa
            </h3>
            <div class="d-flex align-center">
              <v-rating
                :value="selectedReport.mood"
                color="amber"
                background-color="grey lighten-1"
                size="30"
                readonly
                half-increments
                dense
              ></v-rating>
              <span class="ml-2 text-body-1">{{ getMoodText(selectedReport.mood) }}</span>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openFeedbackDialog(selectedReport)">
            <v-icon left>mdi-comment-text</v-icon>
            Berikan Masukan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Feedback Dialog -->
    <v-dialog v-model="feedbackDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-comment-text-outline</v-icon>
          Berikan Masukan
          <v-spacer></v-spacer>
          <v-btn icon @click="feedbackDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-textarea
            v-model="feedbackText"
            outlined
            label="Masukan Anda"
            placeholder="Tulis masukan konstruktif untuk mahasiswa..."
            rows="5"
            counter
            maxlength="1000"
          ></v-textarea>

          <v-select
            v-model="feedbackStatus"
            :items="statusOptions"
            label="Update Status"
            outlined
            dense
          ></v-select>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="feedbackDialog = false">
            Batal
          </v-btn>
          <v-btn color="primary" @click="submitFeedback" :loading="submittingFeedback">
            <v-icon left>mdi-send</v-icon>
            Kirim Masukan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import { useWeeklyReportService } from '@/composables/useWeeklyReport'
import { useMonitoringProgressService } from '@/composables/useMonitoringProgress'
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'profile',
  title: 'Monitoring Perkembangan Mahasiswa',
})

const config = useRuntimeConfig()

const toast = useToast()
const { getReportsBySupervisor } = useWeeklyReportService()
const { submitSupervisorFeedback } = useMonitoringProgressService()

const selectedStudent = ref(null)
const selectedWeek = ref(null)
const filterStatus = ref(null)
const searchQuery = ref('')
const reportDialog = ref(false)
const feedbackDialog = ref(false)
const feedbackText = ref('')
const feedbackStatus = ref('Ditinjau')
const submittingFeedback = ref(false)
const selectedReport = ref(null)
const reports = ref([])

const students = ref([])
const weeks = Array.from({ length: 16 }, (_, i) => ({ title: `Minggu ${i + 1}`, value: i + 1 }))
const statusOptions = [
  { title: 'Semua Status', value: null },
  { title: 'Belum Ditinjau', value: 'Belum Ditinjau' },
  { title: 'Ditinjau', value: 'Ditinjau' },
  { title: 'Revisi', value: 'Revisi' },
  { title: 'Disetujui', value: 'Disetujui' },
]

const summaryStats = ref([
  { title: 'Total Laporan', value: 0, icon: 'mdi-file-document', color: 'primary', avatarColor: 'primary darken-2' },
  { title: 'Belum Ditinjau', value: 0, icon: 'mdi-alert-circle', color: 'orange', avatarColor: 'orange darken-2' },
  { title: 'Perlu Revisi', value: 0, icon: 'mdi-alert', color: 'red', avatarColor: 'red darken-2' },
])

const headers = [
  { title: 'Mahasiswa', value: 'student', sortable: false },
  { title: 'Minggu', value: 'week', align: 'center' },
  { title: 'Tanggal', value: 'date_range' },
  { title: 'Kondisi', value: 'mood', align: 'center' },
  { title: 'Status', value: 'status', align: 'center' },
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

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  return result
})

const loadReports = async () => {
  const { data, error } = await getReportsBySupervisor()

  if (error.value) {
    toast.error('Gagal memuat laporan!')
    console.error("Error fetching reports:", error.value)
    return
  }

  const rawReports = data.value?.data || []
  console.log("RAW REPORTS:", rawReports)

  reports.value = rawReports.map(r => ({
    ...r,
    date_range: `${r.start_date} - ${r.end_date}`
  }))

  summaryStats.value[0].value = reports.value.length
  summaryStats.value[1].value = reports.value.filter(r => r.status === 'Belum Ditinjau').length
  summaryStats.value[2].value = reports.value.filter(r => r.status === 'Revisi').length

  const uniqueStudents = [...new Map(reports.value.map(r => [
    r.student?.nim,
    {
      title: `${r.student?.name} (${r.student?.nim})`,
      value: r.student?.nim
    }
  ])).values()]

  students.value = uniqueStudents

  console.log("✅ Students populated:", students.value)
}

onMounted(() => {
  console.log("📦 Loading weekly reports...")
  loadReports()
})

watchEffect(() => {
  console.log("🧪 Students Ref Value (Reactive):", students.value)
})

watch(selectedStudent, (newVal) => {
  console.log("🎯 Student Selected:", newVal)
})

const applyFilters = () => {
  // log current filter state
  console.log('Applied Filters:', {
    selectedStudent: selectedStudent.value,
    selectedWeek: selectedWeek.value,
    filterStatus: filterStatus.value
  })
}

const openReportDialog = (report) => {
  selectedReport.value = report
  reportDialog.value = true
}

const openFeedbackDialog = (report) => {
  selectedReport.value = report
  feedbackText.value = report.feedback || ''
  feedbackStatus.value = report.status
  feedbackDialog.value = true
  reportDialog.value = false
}

const submitFeedback = async () => {
  submittingFeedback.value = true

  try {
    const payload = {
      weekly_report_id: selectedReport.value.id,
      feedback: feedbackText.value,
      status: feedbackStatus.value
    }

    const { data, error } = await submitSupervisorFeedback(payload)

    if (error.value) {
      throw new Error(error.value.data?.message || 'Gagal menyimpan feedback')
    }

    toast.success('Masukan berhasil dikirim!')
    feedbackDialog.value = false

    // Optional: Update status & feedback di local data
    const index = reports.value.findIndex(r => r.id === selectedReport.value.id)
    if (index !== -1) {
      reports.value[index].status = feedbackStatus.value
      reports.value[index].feedback = feedbackText.value
    }

  } catch (e) {
    toast.error(e.message || 'Terjadi kesalahan saat mengirim feedback')
  } finally {
    submittingFeedback.value = false
  }
}

const getMoodIcon = (mood) => {
  if (mood >= 4) return 'mdi-emoticon-excited'
  if (mood >= 3) return 'mdi-emoticon-happy'
  if (mood >= 2) return 'mdi-emoticon-neutral'
  return 'mdi-emoticon-sad'
}

const getMoodColor = (mood) => {
  if (mood >= 4) return 'green'
  if (mood >= 3) return 'light-green'
  if (mood >= 2) return 'orange'
  return 'red'
}

const getMoodText = (mood) => {
  if (mood >= 4.5) return 'Sangat Baik'
  if (mood >= 3.5) return 'Baik'
  if (mood >= 2.5) return 'Cukup'
  if (mood >= 1.5) return 'Kurang Baik'
  return 'Tidak Baik'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Disetujui': return 'green'
    case 'Ditinjau': return 'primary'
    case 'Revisi': return 'orange'
    case 'Belum Ditinjau': return 'grey'
    default: return 'grey'
  }
}
</script>


<style scoped>
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>