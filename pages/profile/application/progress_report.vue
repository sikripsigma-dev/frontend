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
                Isi perkembangan mingguan Anda dan bagaimana perasaan Anda
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Form -->
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="mb-6">
          <v-form ref="formRef" @submit.prevent="submit">
            <v-card-text class="pa-6">
              <v-select
                v-model="form.week"
                :items="weeks"
                label="Minggu Ke-"
                outlined
                required
                prepend-icon="mdi-calendar"
              />

              <v-text-field
                v-model="dateRangeDisplay"
                label="Rentang Tanggal"
                outlined
                readonly
                prepend-icon="mdi-calendar-range"
              />

              <v-textarea
                v-model="form.progress"
                outlined
                label="Apa yang sudah Anda capai minggu ini?"
                rows="5"
                required
                prepend-icon="mdi-text-box"
              />

              <v-textarea
                v-model="form.plans"
                outlined
                label="Apa rencana Anda untuk minggu depan?"
                rows="3"
                required
                prepend-icon="mdi-calendar-arrow-right"
              />

              <!-- Mood -->
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
                    depressed
                    fab
                    small
                    @click="form.mood = index"
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

              <v-textarea
                v-model="form.notes"
                outlined
                label="Catatan Tambahan"
                rows="2"
                prepend-icon="mdi-note"
              />

              <v-file-input
                v-model="form.files"
                multiple
                prepend-icon="mdi-paperclip"
                label="Lampiran File"
                show-size
                :rules="fileRules"
              />
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
              <v-btn color="grey lighten-1" text @click="reset">
                Reset
              </v-btn>
              <v-spacer />
              <v-btn color="primary" type="submit" :loading="submitting" depressed>
                <v-icon left>mdi-send</v-icon>
                Kirim Laporan
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>

        <!-- Previous Reports -->
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
                <v-chip :color="item.status === 'Diterima' ? 'success' : 'grey'" small>
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
import { useWeeklyReportService } from '@/composables/useWeeklyReport'
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'profile',
  title: 'Laporan Perkembangan Mingguan',
})

const toast = useToast()
const { submitReport, getMyReports } = useWeeklyReportService()

const formRef = ref()
const submitting = ref(false)

const form = ref({
  week: null,
  progress: '',
  plans: '',
  mood: 2,
  notes: '',
  files: []
})

const weeks = Array.from({ length: 16 }, (_, i) => i + 1)
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
  if (!form.value.week) return ''
  const start = new Date(2023, 1, 12)
  start.setDate(start.getDate() + (form.value.week - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
})

const getISODateRange = () => {
  const start = new Date(2023, 1, 12)
  start.setDate(start.getDate() + (form.value.week - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

// 🚀 Submit
const submit = async () => {
  submitting.value = true

  const formData = new FormData()
  formData.append('week', form.value.week)
  formData.append('progress', form.value.progress)
  formData.append('plans', form.value.plans)
  formData.append('mood', form.value.mood)
  formData.append('notes', form.value.notes)
  // formData.append('start_date', dateRange.value.split(' - ')[0])
  // formData.append('end_date', dateRange.value.split(' - ')[1])

  const { start_date, end_date } = getISODateRange()
  formData.append('start_date', start_date)
  formData.append('end_date', end_date)

  // Tambahkan file satu per satu
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


const reset = () => {
  form.value = {
    week: null,
    progress: '',
    plans: '',
    mood: 2,
    notes: '',
    files: []
  }
}

// 🔁 Fetch laporan sebelumnya
const previousReports = ref([])
const reportHeaders = [
  { text: 'Minggu Ke-', value: 'week' },
  { text: 'Tanggal', value: 'date' },
  { text: 'Perasaan', value: 'mood' },
  { text: 'Status', value: 'status' },
  { text: 'Aksi', value: 'actions', sortable: false }
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
