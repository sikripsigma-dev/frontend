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
                  <v-text-field v-model="dateRangeDisplay" label="Rentang Tanggal" outlined readonly prepend-icon="mdi-calendar-range" />
                  <v-textarea v-model="form.progress" outlined label="Apa yang sudah Anda capai minggu ini?" rows="5" required prepend-icon="mdi-text-box" />
                  <v-textarea v-model="form.plans" outlined label="Apa rencana Anda untuk minggu depan?" rows="3" required prepend-icon="mdi-calendar-arrow-right" />
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
                  <v-text-field v-model="dateRangeDisplay" label="Rentang Tanggal" outlined readonly prepend-icon="mdi-calendar-range" />
                  <v-textarea v-model="companyForm.activities" label="Progress Anda minggu ini dalam pengerjaan studi kasus perusahaan" outlined rows="4" prepend-icon="mdi-briefcase-check" required />
                  <v-textarea v-model="companyForm.issues" label="Kendala atau hambatan yang Anda hadapi" outlined rows="3" prepend-icon="mdi-alert" />
                  <v-textarea v-model="companyForm.hopes" label="Saran/Harapan terhadap pembimbing perusahaan" outlined rows="3" prepend-icon="mdi-account-group" />
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
              :headers="reportHeaders"
              :items="previousReports"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.mood="{ item }">
                <v-icon :color="moods[item.mood]?.color">
                  {{ moods[item.mood]?.icon }}
                </v-icon>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip :color="item.status === 'Diterima' ? 'success' : 'warning'" small>
                  {{ item.status }}
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useWeeklyReportService } from '@/composables/useWeeklyReport'
import { useAssignmentService } from '@/composables/useAssignment'

definePageMeta({
  layout: 'profile',
  title: 'Laporan Perkembangan Mingguan',
})

const toast = useToast()
const { submitReport, getMyReports, submitCompanyReport } = useWeeklyReportService()
const { getMyAssignment } = useAssignmentService()

const activeTab = ref('dospem')
const formRef = ref()
const submitting = ref(false)
const assignmentTitle = ref('')
const researchCaseId = ref('')
const sharedWeek = ref(null)

const weeks = Array.from({ length: 16 }, (_, i) => i + 1)

const form = ref({
  progress: '',
  plans: '',
  mood: 2,
  notes: '',
  files: []
})

const companyForm = ref({
  activities: '',
  issues: '',
  hopes: '',
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

const dateRangeDisplay = computed(() => {
  if (!sharedWeek.value) return ''
  const start = new Date(2023, 1, 12)
  start.setDate(start.getDate() + (sharedWeek.value - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
})

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

const fetchActiveAssignment = async () => {
  const { data } = await getMyAssignment()
  if (data.value) {
    assignmentTitle.value = data.value.data.research_case.title
    researchCaseId.value = data.value.data.research_case.id
  }
}
fetchActiveAssignment()

const submit = async () => {
  if (!sharedWeek.value) {
    toast.error('Silakan pilih minggu terlebih dahulu.')
    return
  }

  submitting.value = true

  const formData = new FormData()
  formData.append('week', sharedWeek.value)
  formData.append('progress', form.value.progress)
  formData.append('plans', form.value.plans)
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
    await loadReports()
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
  formData.append('issues', companyForm.value.issues)
  formData.append('hopes', companyForm.value.hopes)
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
  } catch (e) {
    toast.error('Gagal mengirim laporan perusahaan')
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  form.value = {
    progress: '',
    plans: '',
    mood: 2,
    notes: '',
    files: []
  }
  sharedWeek.value = null
}

const resetCompany = () => {
  companyForm.value = {
    activities: '',
    issues: '',
    hopes: '',
    notes: '',
    files: []
  }
  sharedWeek.value = null
}

const previousReports = ref([])
const reportHeaders = [
  { title: 'Minggu Ke-', value: 'week' },
  { title: 'Tanggal', value: 'date' },
  { title: 'Perasaan', value: 'mood' },
  { title: 'Status', value: 'status' },
  { title: 'Aksi', value: 'actions', sortable: false }
]

const loadReports = async () => {
  const { data, error } = await getMyReports()
  if (data.value) {
    previousReports.value = data.value.data.map(r => ({
      ...r,
      date: `${r.start_date} - ${r.end_date}`
    }))
  } else if (error.value) {
    toast.error('Gagal memuat laporan')
  }
}
loadReports()

const viewReport = (report) => {
  console.log('Lihat laporan:', report)
}
</script>

<style scoped>
.v-card {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
.v-card + .v-card {
  margin-top: 32px;
}
.v-card-text {
  padding-top: 24px !important;
  padding-bottom: 24px !important;
}
.v-btn--active {
  transform: scale(1.05);
  transition: all 0.2s ease;
}
.v-btn:hover {
  filter: brightness(1.05);
}
.v-icon.mr-3 {
  margin-top: -2px;
}
.v-data-table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.875rem;
}
.v-data-table-header th {
  font-weight: 600;
  background-color: #f8f9fa;
}
.v-data-table tbody tr:hover {
  background-color: #f0f4f8;
  transition: background-color 0.2s ease;
}
</style>