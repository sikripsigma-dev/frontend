<template>
  <v-container fluid class="pa-0 fill-height bg-grey-lighten-5">
    <v-row justify="center" class="ma-0">
      <v-col cols="12" class="px-4 py-6">
        <!-- Main Card with shadow-->
        <v-card elevation="0" rounded="xl" class="overflow-hidden border-card">
          <!-- Header -->
          <div class="primary-gradient py-4 px-4 text-white">
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-btn icon dark @click="router.back()" class="mr-2">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <span class="text-h5 font-weight-bold">Detail Studi Kasus</span>
              </div>
              <v-chip color="white" text-color="success" class="font-weight-bold">
                <v-icon start>mdi-bookmark-outline</v-icon> Case Study
              </v-chip>
            </div>
            <p class="text-body-2 mt-1 opacity-80">
              Informasi lengkap tentang studi kasus yang telah diajukan
            </p>
          </div>

          <!-- Skeleton loader -->
          <v-skeleton-loader v-if="pending" type="article, actions" class="pa-6" />

          <!-- Main Content -->
          <v-card-text v-else-if="researchCase" class="px-4 py-6">
            <!-- Judul -->
            <div class="d-flex align-center mb-6">
              <v-avatar color="primary" size="40" class="mr-3">
                <v-icon dark size="22">mdi-flower-outline</v-icon>
              </v-avatar>
              <div>
                <h2 class="text-h6 font-weight-bold mb-1">{{ researchCase.title }}</h2>
                <div class="d-flex align-center">
                  <v-icon small color="grey" class="mr-1">mdi-map-marker-outline</v-icon>
                  <span class="text-caption text-grey">{{ researchCase.location || 'Remote' }}</span>
                </div>
              </div>
            </div>

            <!-- Info Cards -->
            <v-row class="mb-6" dense>
              <v-col cols="12" sm="6" md="3" v-for="item in cardDetails" :key="item.label">
                <v-card elevation="1" rounded="lg" class="pa-3 text-center">
                  <v-icon :color="item.iconColor" size="26" class="mb-1">{{ item.icon }}</v-icon>
                  <div class="text-body-2 font-weight-medium">{{ item.label }}</div>
                  <div class="text-caption text-grey-darken-1 text-truncate">
                    {{ item.value || '-' }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Deskripsi -->
            <v-card elevation="0" rounded="lg" class="mb-6 border-card">
              <v-card-title class="d-flex align-center bg-grey-lighten-4">
                <v-icon color="primary" class="mr-2">mdi-text-box-outline</v-icon>
                <span class="text-subtitle-1 font-weight-bold">Deskripsi Studi Kasus</span>
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="text-body-2 line-height-2" v-html="formatDescription(researchCase.description || '')"></div>
              </v-card-text>
            </v-card>

            <!-- Tombol Aksi -->
            <!-- <div class="d-flex justify-end mt-4">
              <v-btn color="primary" variant="flat" size="large" class="mr-2 px-5">
                <v-icon start>mdi-file-document-edit-outline</v-icon> Ajukan Proposal
              </v-btn>
              <v-btn color="secondary" variant="outlined" size="large" class="px-5">
                <v-icon start>mdi-bookmark-outline</v-icon> Simpan
              </v-btn>
            </div> -->
          </v-card-text>

          <!-- Error -->
          <v-alert v-else type="error" class="ma-6">
            Gagal memuat detail studi kasus. Silakan coba lagi.
          </v-alert>
        </v-card>

        <!-- Related -->
        <v-card elevation="0" rounded="xl" class="mt-6 pa-6 border-card">
          <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon color="primary" class="mr-2">mdi-lightbulb-on-outline</v-icon>
            Studi Kasus Terkait
          </v-card-title>
          <v-slide-group show-arrows>
            <v-slide-group-item v-for="i in 3" :key="i">
              <v-card elevation="2" rounded="lg" class="ma-2" width="260">
                <v-img height="100" src="https://source.unsplash.com/random/300x200?plant" cover></v-img>
                <v-card-title class="text-body-2 font-weight-bold">Budidaya Anggrek Varietas Baru</v-card-title>
                <v-card-subtitle class="text-caption">6 bulan • Pontianak</v-card-subtitle>
                <v-card-actions>
                  <v-btn color="primary" variant="text" size="small">Lihat Detail</v-btn>
                </v-card-actions>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useResearchCaseService, type ResearchCase } from '@/composables/useResearchCase'
import { ref, computed } from 'vue'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const router = useRouter()
const { getById } = useResearchCaseService()

const researchCase = ref<ResearchCase | null>(null)
const pending = ref(false)

const fetchCase = async () => {
  pending.value = true
  const { data, error } = await getById(route.params.id as string)
  if (error.value) {
    console.error('Gagal memuat studi kasus:', error.value)
  } else {
    researchCase.value = data.value?.research_case || null
  }
  pending.value = false
}
fetchCase()

const formatDescription = (text: string) => text.replace(/\n/g, '<br>')

const cardDetails = computed(() => [
  {
    label: 'Durasi',
    value: researchCase.value?.duration,
    icon: 'mdi-calendar-clock',
    iconColor: 'primary'
  },
  {
    label: 'Pendidikan',
    value: researchCase.value?.education_requirement,
    icon: 'mdi-school-outline',
    iconColor: 'primary'
  },
  {
    label: 'Bidang',
    value: researchCase.value?.field,
    icon: 'mdi-briefcase-outline',
    iconColor: 'primary'
  },
  {
    label: 'Perusahaan',
    value: researchCase.value?.company?.Name,
    icon: 'mdi-office-building-outline',
    iconColor: 'primary'
  }
])
console.log(researchCase.value)
</script>

<style scoped>
.primary-gradient {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

/* .success-gradient {
  background: linear-gradient(135deg, #10b981, #059669);
} */

.success-gradient {
  background: linear-gradient(135deg, #22c55e, #0d9488);
}


.border-card {
  border: 1px solid #e2e8f0;
}
.line-height-2 {
  line-height: 1.8;
}
.opacity-80 {
  opacity: 0.8;
}
.text-grey {
  color: #6b7280;
}
</style>
