<template>
  <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="mx-auto px-4 py-6" style="width: 100%; max-width: 960px; box-sizing: border-box;">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Daftar Studi Kasus</span>
            <v-btn color="primary" @click="tambahStudiKasus">
              <v-icon start>mdi-plus</v-icon>
              Tambah
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="headers"
            :items="tableItems"
            :items-per-page="5"
            class="elevation-0"
            density="comfortable"
            item-value="id"
            :loading="pending"
          >
            <template #item.no="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-1 justify-center">
                <v-btn icon size="small" @click="lihatDetail(item)" variant="tonal">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon size="small" color="primary" @click="editStudiKasus(item)" variant="tonal">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <!-- <v-btn icon size="small" color="error" @click="hapusStudiKasus(item)" variant="tonal">
                  <v-icon>mdi-delete</v-icon>
                </v-btn> -->
              </div>
            </template>

            <template #no-data>
              <v-alert type="info" border="start" variant="tonal" class="ma-4">
                Belum ada studi kasus yang tersedia.
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
import { navigateTo } from '#app'

definePageMeta({
  layout: 'profile',
})

const headers = [
  { title: 'No', key: 'no', sortable: false, align: 'center' },
  { title: 'Judul', key: 'title', sortable: true },
  { title: 'Bidang', key: 'field', sortable: true },
  { title: 'Tanggal Dibuat', key: 'created_at', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false },
]

const { user } = useDataUser()
const { getByCompany, remove } = useResearchCaseService()

const researchCases = ref([])
const pending = ref(false)

const fetchCases = async (companyId) => {
  pending.value = true
  const { data, error } = await getByCompany(companyId)
  if (error.value) {
    console.error('Gagal fetch studi kasus:', error.value)
  } else {
    researchCases.value = data.value?.research_cases || []
  }
  pending.value = false
}

watch(() => user.value, (val) => {
  if (val?.company?.id) {
    fetchCases(val.company.id)
  }
}, { immediate: true })

const tableItems = computed(() =>
  researchCases.value.map((rc, index) => ({
    ...rc,
    no: index + 1,
    created_at: rc.created_at ? new Date(rc.created_at).toLocaleDateString() : '-',
  }))
)

const tambahStudiKasus = () => {
  navigateTo('/profile/cases/form')
}

const lihatDetail = (item) => {
  navigateTo(`/profile/cases/${item.id}`)
}

const editStudiKasus = (item) => {
  navigateTo(`/profile/cases/form?id=${item.id}`)
}

// const hapusStudiKasus = async (item) => {
//   if (confirm(`Yakin ingin menghapus studi kasus "${item.title}"?`)) {
//     try {
//       await remove(item.id)
//       alert('Studi kasus berhasil dihapus')
//       fetchCases(user.value.user.company.id) // Refresh data
//     } catch (err) {
//       alert('Gagal menghapus studi kasus')
//       console.error(err)
//     }
//   }
// }
</script>


<style scoped>
.gap-1 > * {
  margin-right: 4px;
}
</style>
