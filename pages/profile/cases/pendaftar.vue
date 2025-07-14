<template>
  <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
    <v-row no-gutters class="fill-height">
      <v-col
        cols="12"
        class="mx-auto px-4 py-6"
        style="width: 100%; max-width: 960px; box-sizing: border-box;"
      >
        <!-- Card Studi Kasus -->
        <v-card elevation="2" rounded="lg">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
            <div>
              <v-icon class="mr-2" color="primary">mdi-book-open-page-variant</v-icon>
              List Studi Kasus
            </div>
            <!-- search -->
            <v-text-field
              v-model="searchQuery"
              placeholder="Cari studi kasus..."
              density="compact"
              hide-details
              append-inner-icon="mdi-magnify"
              style="max-width: 250px;"
              variant="outlined"
              color="primary"
            />
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="headers"
            :items="filteredCases"
            :items-per-page="5"
            class="elevation-0 min-width-table"
            density="comfortable"
            item-value="id"
            :loading="pendingCases"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>
            <template #item.actions="{ item }">
              <v-btn
                icon
                density="comfortable"
                color="primary"
                variant="tonal"
                style="width: 36px; height: 36px; padding: 0;"
                @click="loadApplicants(item.id, item.title)"
              >
                <v-icon>mdi-account-group</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Card Pendaftar -->
        <v-card
          elevation="2"
          rounded="lg"
          class="mt-6"
        >
          <!-- <v-card-title class="text-h6 font-weight-bold">
            List Pendaftar
          </v-card-title> -->

          <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
            <div>
              <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
              List Pendaftar
            </div>
            <div v-if="selectedCaseTitle" class="text-body-2 text-grey-darken-1">
              Studi Kasus: <strong>{{ selectedCaseTitle }}</strong>
            </div>
          </v-card-title>


          <v-divider />

          <v-data-table
            :headers="applicantHeaders"
            :items="applicants"
            :items-per-page="5"
            class="elevation-0 min-width-table"
            density="comfortable"
            item-value="id"
            :loading="pendingApplicants"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>
            
            <template #item.status="{ item }">
              <v-chip
                :color="statusColor(item.status)"
                variant="tonal"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions_applicant="{ item }">
              <v-btn
                icon
                size="small"
                color="green"
                variant="tonal"
                @click="reviewApplication(item.id, 'diterima')"
                class="mr-1"
              >
                <v-icon size="small">mdi-check</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="red"
                variant="tonal"
                @click="reviewApplication(item.id, 'ditolak')"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </template>


            <template #no-data>
              <v-alert
                type="info"
                border="start"
                variant="tonal"
                class="ma-4"
              >
                Belum ada pendaftar untuk studi kasus ini.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataUser } from '@/composables/useDataUser'
import { useResearchCaseService } from '@/composables/useResearchCase'
import { useApplicationService } from '@/composables/useApplication'
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'profile',
})

const { user } = useDataUser()
const { getByCompany } = useResearchCaseService()
const { getByResearchCase } = useApplicationService()
const { processApplication } = useApplicationService()

const researchCases = ref([])
const pendingCases = ref(false)

const applicants = ref([])
const pendingApplicants = ref(false)

const headers = [
  { title: 'No', key: 'no', sortable: false, align: 'center' },
  { title: 'Judul', key: 'title', sortable: true },
  { title: 'Bidang', key: 'field', sortable: true },
  { title: 'Tanggal Dibuat', key: 'created_at', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false , align: 'center' },
]

const applicantHeaders = [
  { title: 'No', key: 'no', sortable: false, align: 'center' },
  { title: 'Nama', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Tanggal Daftar', key: 'applied_at', sortable: true },
  { title: 'Aksi', key: 'actions_applicant', sortable: false, align: 'center' },
]

const searchQuery = ref('')
const selectedCaseTitle = ref('')

// Fetch research cases
watch(
  () => user.value,
  async (val) => {
    if (val?.company?.id) {
      pendingCases.value = true
      const { data, error } = await getByCompany(val.company.id)
      if (!error.value && data.value) {
        researchCases.value = data.value.research_cases.map((rc, index) => ({
          ...rc,
          created_at: rc.created_at
            ? new Date(rc.created_at).toLocaleDateString()
            : '-',
          no: index + 1,
        }))
      }
      pendingCases.value = false
    }
  },
  { immediate: true }
)

const toast = useToast()

const reviewApplication = async (applicationId, status) => {
  try {
    await processApplication(applicationId, status)

    if (status === 'ditolak') {
      toast.error(`Mahasiswa ditolak untuk studi kasus "${selectedCaseTitle.value || '-'}"`)
    } else {
      toast.success(`Mahasiswa diterima untuk studi kasus "${selectedCaseTitle.value || '-'}"`)
    }

    // Refresh ulang daftar pendaftar
    const selected = researchCases.value.find(c => c.title === selectedCaseTitle.value)
    if (selected) {
      await loadApplicants(selected.id, selected.title)
    }
  } catch (err) {
    toast.error('Gagal memproses aplikasi')
    console.error('[reviewApplication] Error:', err)
  }
}

const loadApplicants = async (researchCaseId, researchCaseTitle) => {
  pendingApplicants.value = true
  applicants.value = []
  selectedCaseTitle.value = researchCaseTitle || ''

  const { data, error } = await getByResearchCase(researchCaseId)

  if (!error.value && data.value) {
    if (Array.isArray(data.value.applications)) {
      applicants.value = data.value.applications.map((a, index) => ({
        id: a.id,
        name: a.user?.name || '-',
        email: a.user?.email || '-',
        status: a.status,
        applied_at: a.applied_at 
          ? new Date(a.applied_at).toLocaleDateString()
          : '-',
        no: index + 1,
      }))
    }
  }

  pendingApplicants.value = false
}

const filteredCases = computed(() => {
  if (!searchQuery.value) return researchCases.value
  return researchCases.value.filter(rc =>
    rc.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const statusColor = (status) => {
  switch (status) {
    case 'diajukan' || 'menunggu':
      return 'blue'
    case 'diterima':
      return 'green'
    case 'ditolak':
      return 'red'
    default:
      return 'grey'
  }
}
</script>


<style scoped>
.fill-height {
  height: 100vh;
}
</style>
