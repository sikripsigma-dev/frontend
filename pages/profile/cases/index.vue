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
                <!-- <v-btn icon size="small" @click="lihatDetail(item)" variant="tonal">
                  <v-icon>mdi-eye</v-icon>
                </v-btn> -->
                <v-btn icon size="small" color="primary" @click="editStudiKasus(item)" variant="tonal">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  :color="item.is_active ? 'green' : 'grey'"
                  @click="ubahStatusStudiKasus(item)"
                  variant="tonal"
                >
                  <v-icon>{{ item.is_active ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>

                <!-- NEW: tombol komentar -->
                <v-btn
                  icon
                  size="small"
                  color="indigo"
                  @click="bukaKomentar(item)"
                  variant="tonal"
                >
                  <v-icon>mdi-comment-text-outline</v-icon>
                </v-btn>
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

    <!-- NEW: Dialog Komentar -->
    <v-dialog v-model="dialogKomentar" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-comment-text-multiple-outline</v-icon>
          Komentar Kaprodi — {{ selectedCaseTitle }}
          <v-spacer />
          <v-btn icon @click="dialogKomentar = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text>
          <div v-if="komentarLoading" class="d-flex justify-center my-6">
            <v-progress-circular indeterminate />
          </div>

          <template v-else>
            <v-alert v-if="komentar.length === 0" type="info" variant="tonal" border="start">
              Belum ada komentar untuk studi kasus ini.
            </v-alert>

            <v-list v-else lines="three" density="comfortable">
              <v-list-item
                v-for="(kmt, i) in komentar"
                :key="kmt.ID || i"
              >
                <template #prepend>
                  <v-avatar size="36">
                    <!-- Jika BE menyimpan image di ProgramHead.Image -->
                    <v-icon v-if="!kmt.ProgramHead?.Image">mdi-account-circle</v-icon>
                    <v-img v-else :src="kmt.ProgramHead.Image" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ kmt.ProgramHead?.Name || 'Kaprodi' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption mb-1">
                  {{ formatWaktu(kmt.CreatedAt || kmt.created_at) }}
                </v-list-item-subtitle>
                <div class="text-body-2">
                  {{ kmt.Comment || kmt.comment }}
                </div>
              </v-list-item>
            </v-list>
          </template>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogKomentar = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataUser } from '@/composables/useDataUser'
import { useResearchCaseService } from '@/composables/useResearchCase'
import { useResearchCaseValidation } from '@/composables/useResearchCaseValidation' // ⬅️ NEW
import { navigateTo } from '#app'
import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'profile' })

const headers = [
  { title: 'No', key: 'no', sortable: false, align: 'center' },
  { title: 'Judul', key: 'title', sortable: true },
  { title: 'Bidang', key: 'field', sortable: true },
  { title: 'Tanggal Dibuat', key: 'created_at', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false },
]

const toast = useToast()
const { user } = useDataUser()
const { getByCompany, toggleActive } = useResearchCaseService()
const { getComments } = useResearchCaseValidation()          // ⬅️ NEW

const researchCases = ref([])
const pending = ref(false)

// state untuk dialog komentar
const dialogKomentar = ref(false)
const komentarLoading = ref(false)
const komentar = ref([])
const selectedCaseId = ref(null)
const selectedCaseTitle = ref('')

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

const ubahStatusStudiKasus = async (item) => {
  const newStatus = !item.is_active
  try {
    await toggleActive(item.id, newStatus)
    toast.success(`Studi kasus berhasil di-${newStatus ? 'aktifkan' : 'nonaktifkan'}`)
    if (user.value?.company?.id) fetchCases(user.value.company.id)
  } catch (err) {
    toast.error('Gagal mengubah status studi kasus')
    console.error('[ubahStatusStudiKasus]', err)
  }
}

watch(() => user.value, (val) => {
  if (val?.company?.id) fetchCases(val.company.id)
}, { immediate: true })

const tableItems = computed(() =>
  researchCases.value.map((rc, index) => ({
    ...rc,
    no: index + 1,
    created_at: rc.created_at ? new Date(rc.created_at).toLocaleDateString('id-ID') : '-',
  }))
)

const tambahStudiKasus = () => navigateTo('/profile/cases/form')
const lihatDetail = (item) => navigateTo(`/profile/cases/${item.id}`)
const editStudiKasus = (item) => navigateTo(`/profile/cases/form?id=${item.id}`)

// NEW: buka dialog komentar + fetch
const bukaKomentar = async (item) => {
  selectedCaseId.value = item.id
  selectedCaseTitle.value = item.title
  komentar.value = []
  komentarLoading.value = true
  dialogKomentar.value = true
  try {
    const { data, error } = await getComments(item.id)
    if (error.value) throw error.value
    // BE memakai capitalized keys (CreatedAt, Comment, ProgramHead)
    komentar.value = data.value?.comments || []
  } catch (e) {
    console.error(e)
    komentar.value = []
    // optional toast
  } finally {
    komentarLoading.value = false
  }
}

const formatWaktu = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.gap-1 > * { margin-right: 4px; }
</style>
