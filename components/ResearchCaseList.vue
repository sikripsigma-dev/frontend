<template>
  <v-container>
    <v-row>
      <!-- Sidebar Kiri -->
      <v-col cols="12" md="4" style="max-height: 90vh; overflow-y: auto;">
        <template v-if="loading">
          <v-skeleton-loader v-for="i in 3" :key="i" type="card" class="mb-3" boilerplate />
        </template>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-3" prominent>
          <v-icon start>mdi-alert-circle</v-icon>
          <strong>Oops!</strong> Gagal memuat studi kasus.
        </v-alert>

        <template v-else>
          <template v-if="paginatedCases.length">
            <v-card
              v-for="caseItem in paginatedCases"
              :key="caseItem.id"
              class="mb-3 company-card"
              @click="selectCompany(caseItem)"
              :class="{ 'selected-company': selectedCase?.id === caseItem.id }"
              elevation="2"
            >
              <v-card-title class="d-flex align-center">
                <v-avatar size="40" class="mr-3" color="blue-grey" variant="tonal">
                  <template v-if="caseItem.company?.logo">
                    <v-img :src="caseItem.company.logo" alt="Company Logo" cover />
                  </template>
                  <template v-else>
                    <span class="white--text font-weight-bold text-subtitle-2">
                      {{ getInitials(caseItem.company?.Name) }}
                    </span>
                  </template>
                </v-avatar>
                <span>{{ caseItem.company?.Name || 'Unknown Company' }}</span>
              </v-card-title>

              <v-card-subtitle>{{ caseItem.title }}</v-card-subtitle>

              <v-card-text>
                <v-chip-group>
                  <v-chip
                    v-for="tag in caseItem.tags || []"
                    :key="tag.id"
                    color="primary"
                    outlined
                  >
                    {{ tag.name }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>

              <v-divider />
              <v-card-actions class="d-flex justify-space-between">
                <div class="text-body-2">
                  <v-icon size="18" class="mr-1" color="blue">mdi-school</v-icon>
                  {{ caseItem.education_requirement }}
                </div>
                <div class="text-body-2">
                  <v-icon size="18" class="mr-1" color="green">mdi-timer</v-icon>
                  {{ caseItem.duration || 'Durasi tidak disebutkan' }}
                </div>
              </v-card-actions>
            </v-card>

            <div class="text-center mt-4">
              <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
            </div>
          </template>

          <template v-else>
            <v-alert type="warning" variant="outlined" class="mt-4">
              <v-icon start>mdi-magnify-close</v-icon>
              Tidak ada hasil yang cocok.
            </v-alert>
          </template>
        </template>
      </v-col>

      <!-- Detail Kanan -->
      <v-col cols="12" md="8">
        <template v-if="loading">
          <v-skeleton-loader type="article" class="mb-3" boilerplate />
        </template>

        <v-alert
          v-if="!selectedCase"
          type="info"
          variant="tonal"
          prominent
          class="custom-alert"
        >
          <v-icon start>mdi-information</v-icon>
          Klik salah satu perusahaan untuk melihat detail studi kasus.
        </v-alert>

        <transition name="fade" mode="out-in">
          <template v-if="selectedCase">
            <v-card key="detail" elevation="3" class="pa-4">
              <v-card-title class="d-flex justify-space-between align-center">
                <h2 class="text-h6">{{ selectedCase.title }}</h2>
                <v-btn
                  :disabled="!eligible"
                  color="primary"
                  class="mr-3"
                  variant="flat"
                  :loading="applying"
                  @click="handleApply"
                >
                  <template v-if="isAssigned">Sudah Ditugaskan</template>
                  <template v-else-if="alreadyApplied">Sudah Apply</template>
                  <template v-else>Apply Now</template>
                </v-btn>
              </v-card-title>

              <v-card-subtitle>
                <v-icon>mdi-domain</v-icon> {{ selectedCase.company?.Name || '-' }} |
                <v-icon>mdi-map-marker</v-icon> {{ selectedCase.company?.Address || '-' }}
              </v-card-subtitle>

              <v-divider class="my-3" />

              <!-- Alert jika sudah assigned -->
              <v-alert
                v-if="isAssigned && selectedCase"
                type="warning"
                variant="outlined"
                class="mb-4"
              >
                <v-icon start>mdi-alert</v-icon>
                Kamu sudah aktif dalam studi kasus lain, dan tidak bisa apply ke studi kasus ini.
              </v-alert>

              <v-card-text>
                <h3>Description</h3>
                <p>{{ selectedCase.description }}</p>
              </v-card-text>
            </v-card>
          </template>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useResearchCase } from '~/composables/useResearchCase_old'

const {
  loading,
  error,
  fetchResearchCases,
  selectedCompany: selectedCase,
  selectCompany,
  currentPage,
  paginatedCases,
  totalPages,
  applyToCase,
  checkIfApplied,
} = useResearchCase()

const applying = ref(false)
const alreadyApplied = ref(false)
const isAssigned = ref(false)
const eligible = ref(true)
const toast = useToast()

onMounted(() => {
  fetchResearchCases()
})

watch(selectedCase, async (newCase) => {
  alreadyApplied.value = false
  isAssigned.value = false
  eligible.value = true

  if (newCase) {
    const result = await checkIfApplied(newCase.id)

    if (result.assigned) {
      isAssigned.value = true
      eligible.value = false
      return // PRIORITAS: Stop di sini kalau sudah assigned
    }

    alreadyApplied.value = result.applied
    eligible.value = !result.applied
  }
})

const handleApply = async () => {
  if (!selectedCase.value || isAssigned.value || alreadyApplied.value) return

  try {
    applying.value = true
    const res = await applyToCase(selectedCase.value.id)
    applying.value = false

    if (res.success) {
      alreadyApplied.value = true
      eligible.value = false
      toast.success(`Berhasil apply ke studi kasus: ${selectedCase.value.title}`)
    } else {
      toast.error(`Gagal apply: ${res.error}`)
    }
  } catch (error) {
    applying.value = false
    toast.error('Terjadi kesalahan saat mengirim aplikasi.')
  }
}

function getInitials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.company-card {
  transition: transform 0.2s;
  cursor: pointer;
}
.company-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.selected-company {
  border: 3px solid #1976d2;
  background-color: #e3f2fd;
  box-shadow: 0 0 8px #1976d2;
}
.custom-alert {
  margin-bottom: 16px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.v-avatar span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>
