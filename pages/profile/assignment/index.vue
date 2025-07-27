<template>
  <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="mx-auto px-4 py-6" style="max-width: 1000px">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Daftar Assignment</span>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="headers"
            :items="tableItems"
            :items-per-page="5"
            class="elevation-0"
            density="comfortable"
            :loading="pending"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.title="{ item }">
              {{ item.research_case.title }}
            </template>

            <template #item.name="{ item }">
              {{ item.user.name }}
            </template>

            <template #item.started_at="{ item }">
              {{ formatDate(item.started_at) }}
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'active' ? 'green' : 'grey'"
                size="small"
                class="text-white"
              >
                {{ item.status === 'active' ? 'Aktif' : 'Selesai' }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-tooltip text="Tandai selesai assignment" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    v-bind="props"
                    color="success"
                    :disabled="item.status !== 'active'"
                    @click="toggleStatus(item)"
                  >
                    <v-icon>mdi-check-circle-outline</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>

            <template #no-data>
              <v-alert type="info" border="start" variant="tonal" class="ma-4">
                Belum ada assignment yang tersedia.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAssignmentService } from '@/composables/useAssignment'
import { useDataUser } from '@/composables/useDataUser'
import { useToast } from 'vue-toastification'
import { navigateTo } from '#app'

definePageMeta({
  layout: 'profile',
})

const { getByCompany, updateStatus } = useAssignmentService()
const { user } = useDataUser()
const toast = useToast()

const assignments = ref([])
const pending = ref(false)

const headers = [
  { title: 'No', key: 'no', sortable: false, align: 'center' },
  { title: 'Judul Studi Kasus', key: 'title', sortable: true },
  { title: 'Nama Mahasiswa', key: 'name', sortable: true },
  { title: 'Mulai', key: 'started_at', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' },
]

const fetchAssignments = async () => {
  if (!user.value?.company?.id) return
  pending.value = true
  try {
    const { data, error } = await getByCompany()
    if (!error.value) {
      assignments.value = data.value?.data || []
    } else {
      console.error('Gagal fetch assignment:', error.value)
    }
  } finally {
    pending.value = false
  }
}

const toggleStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'inactive' : 'active'
  try {
    await updateStatus(item.id, newStatus)
    item.status = newStatus // Optimistic update

    toast.success(`Status assignment berhasil diubah menjadi ${newStatus === 'inactive' ? 'selesai' : 'aktif'}`)
  } catch (err) {
    console.error('Gagal update status:', err)
    toast.error('Gagal memperbarui status assignment')
  }
}

onMounted(fetchAssignments)

const tableItems = computed(() => assignments.value)

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const lihatDetail = (item) => {
  navigateTo(`/profile/assignments/${item.id}`)
}
</script>

<style scoped>
</style>
