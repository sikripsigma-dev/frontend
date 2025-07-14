<template>
  <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="mx-auto px-4 py-6" style="width: 100%; max-width: 960px; box-sizing: border-box;">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Pengajuan Studi Kasus Saya</span>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="headers"
            :items="tableItems"
            :items-per-page="5"
            class="elevation-0"
            density="comfortable"
            item-value="ID"
            :loading="pending"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small" class="text-capitalize">
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-center">
                <v-btn icon color="primary" size="small" @click="lihatDetail(item.research_case)" variant="tonal">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </div>
            </template>

            <template #no-data>
              <v-alert type="info" border="start" variant="tonal" class="ma-4">
                Belum ada aplikasi yang diajukan.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDataUser } from '@/composables/useDataUser'
import { useApplicationService } from '@/composables/useApplication'
import { navigateTo } from '#app'

definePageMeta({
  layout: 'profile',
})

const headers = [
  { title: 'No', key: 'no', align: 'center' as const, sortable: false },
  { title: 'Judul', key: 'judul', sortable: true },
  { title: 'Bidang', key: 'bidang', sortable: true },
  { title: 'Perusahaan', key: 'perusahaan', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' as const },
]


const { user } = useDataUser()
const { getByStudent } = useApplicationService()

// const applications = ref([])
const applications = ref<Application[]>([])
const pending = ref(false)

const fetchApplications = async (studentId: string) => {
  pending.value = true
  const { data, error } = await getByStudent(studentId)
  if (error.value) {
    console.error('Gagal fetch aplikasi:', error.value)
  } else {
    applications.value = data.value?.applications || []
  }
  pending.value = false
}

watch(() => user.value, (val) => {
  if (val?.id) {
    fetchApplications(val.id)
  }
}, { immediate: true })

const tableItems = computed(() =>
  applications.value.map((app, index) => ({
    ...app,
    no: index + 1,
    judul: app.research_case?.title || '-',
    bidang: app.research_case?.field || '-',
    status: app.status || '-',
    perusahaan: app.research_case?.company?.name || '-',
  }))
)

const lihatDetail = (caseItem: { id: string }) => {
  navigateTo(`/profile/cases/student/${caseItem.id}`)
}

const getStatusColor = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'diajukan': return 'primary'
    case 'diterima': return 'success'
    case 'ditolak': return 'error'
    default: return 'grey'
  }
}
</script>

<style scoped>
.d-flex.gap-1 > * {
  margin-right: 4px;
}
</style>