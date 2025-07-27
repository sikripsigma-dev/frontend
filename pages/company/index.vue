<template>
  <v-container class="py-8">
    <!-- Hero Section -->
    <v-row class="mb-8" justify="center">
      <v-col cols="12" md="10" lg="8" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-4 primary--text">Temukan Perusahaan Terbaik</h1>
        <p class="text-h6 font-weight-regular text-grey-darken-1 mb-6">
          Jelajahi jaringan mitra terpercaya kami dengan rating dan ulasan terverifikasi
        </p>
        <v-text-field
          v-model="search"
          outlined
          placeholder="Search companies..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="mx-auto"
          style="max-width: 600px;"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Filter Chips -->
    <v-row class="mb-6" justify="center">
      <v-col cols="12" class="d-flex flex-wrap justify-center">
        <v-chip
          v-for="(filter, index) in filters"
          :key="index"
          class="ma-1"
          :color="activeFilter === index ? 'primary' : ''"
          :text-color="activeFilter === index ? 'white' : ''"
          @click="activeFilter = index"
        >
          {{ filter.label }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Companies List -->
    <v-row v-if="pending">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="50" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="(company, index) in paginatedCompanies"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          hover
          class="h-100 d-flex flex-column"
          @click="viewCompany(company.id)"
        >
          <v-img
            :src="getCompanyLogo(company.logo)"
            height="160"
            cover
          >
            <v-chip
              small
              class="ma-2"
              color="white"
              text-color="primary"
              v-if="company.featured"
            >
              <v-icon small left>mdi-star</v-icon>
              Featured
            </v-chip>
          </v-img>

          <v-card-title class="text-h6 font-weight-medium">
            {{ company.name }}
          </v-card-title>

          <v-card-subtitle class="d-flex align-center">
            <v-icon small color="grey" class="mr-1">mdi-map-marker-outline</v-icon>
            {{ company.address || 'Alamat tidak tersedia' }}
          </v-card-subtitle>

          <v-card-text class="flex-grow-1">
            <div class="d-flex align-center mb-2">
              <v-rating
                :model-value="4.5"
                color="amber"
                dense
                half-increments
                readonly
                size="18"
              ></v-rating>
              <span class="text-caption text-grey ml-1">
                ({{ Math.floor(Math.random() * 100) + 10 }} reviews)
              </span>
            </div>
            <p class="text-body-2 text-truncate-2">
              {{ company.description || 'Deskripsi belum tersedia' }}
            </p>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn color="primary" small text @click.stop="viewCompany(company.id)">
              View Details
            </v-btn>
            <v-spacer></v-spacer>
            <v-chip small :color="getIndustryColor(company.industry)">
              {{ company.industry || '-' }}
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row class="mt-8" justify="center" v-if="paginatedCompanies.length">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filteredCompanies.length / itemsPerPage)"
          circle
          color="primary"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useDataCompany } from '@/composables/useDataCompany'

const search = ref('')
const page = ref(1)
const itemsPerPage = 8
const activeFilter = ref(0)

const config = useRuntimeConfig()
const router = useRouter()

const {
  companies,
  getCompanies,
  pending
} = useDataCompany()

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Manufacturing', value: 'Manufacturing' }
]

onMounted(async () => {
  await getCompanies()
})

function getCompanyLogo(path: string | null) {
  if (!path) {
    return 'https://via.placeholder.com/300x200?text=No+Image'
  }
  return `${config.public.apiBase}${path}`
}

const filteredCompanies = computed(() => {
  let filtered = companies.value

  if (search.value) {
    const term = search.value.toLowerCase()
    filtered = filtered.filter(company =>
      company.name.toLowerCase().includes(term) ||
      (company.description?.toLowerCase().includes(term) || '') ||
      (company.industry?.toLowerCase().includes(term) || '')
    )
  }

  if (activeFilter.value > 0) {
    const filterVal = filters[activeFilter.value].value
    filtered = filtered.filter(company => company.industry === filterVal)
  }

  return filtered
})

const paginatedCompanies = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredCompanies.value.slice(start, start + itemsPerPage)
})

function viewCompany(id: string) {
  router.push(`/company/${id}`)
}

function getIndustryColor(industry: string) {
  const colors: Record<string, string> = {
    Technology: 'blue lighten-4',
    Finance: 'green lighten-4',
    Healthcare: 'red lighten-4',
    Education: 'amber lighten-4',
    Manufacturing: 'indigo lighten-4',
    Agriculture: 'light-green lighten-4',
    Construction: 'deep-orange lighten-4'
  }
  return colors[industry] || 'grey lighten-3'
}
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.h-100 {
  height: 100%;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.primary--text {
  color: #1976D2 !important;
}
</style>
