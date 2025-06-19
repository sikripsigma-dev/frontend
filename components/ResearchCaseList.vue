<template>
  <v-container>
    <v-row>
      <!-- Sidebar Kiri: Daftar Perusahaan -->
      <v-col cols="12" md="4">
        <!-- Loading -->
        <template v-if="loading">
          <v-skeleton-loader v-for="i in 3" :key="i" type="card" class="mb-3" boilerplate />
        </template>

        <!-- Error -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          prominent
          closable
          elevation="2"
          class="mb-3"
        >
          <v-icon start>mdi-alert-circle</v-icon>
          <strong>Oops!</strong> Failed to fetch research cases. Please try again later.
        </v-alert>

        <!-- Data List -->
        <template v-else>
          <v-card
            v-for="caseItem in paginatedCases"
            :key="caseItem.id"
            class="mb-3 company-card"
            @click="selectCompany(caseItem)"
            :class="{ 'selected-company': selectedCase?.id === caseItem.id }"
            elevation="2"
          >
            <v-card-title class="d-flex align-center">
              <v-avatar size="40" class="mr-3">
                <v-img v-if="caseItem.company.logo" :src="caseItem.company.logo" alt="Company Logo" />
                <v-icon v-else size="40" color="grey">mdi-domain</v-icon>
              </v-avatar>
              <span>{{ caseItem.company.Name }}</span>
            </v-card-title>
            <v-card-subtitle>{{ caseItem.title }}</v-card-subtitle>
            <v-card-text>
              <v-chip-group>
                <v-chip v-for="tag in caseItem.tags || []" :key="tag" color="primary" outlined>
                  {{ tag }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <v-icon color="blue">mdi-school</v-icon> Min. {{ caseItem.education_requirement }}
            </v-card-actions>
          </v-card>

          <div class="text-center">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              rounded="circle"
            />
          </div>
        </template>
      </v-col>

      <!-- Detail Kanan -->
      <v-col cols="12" md="8">
        <template v-if="loading">
          <v-skeleton-loader type="article" class="mb-3" boilerplate />
          <v-skeleton-loader type="paragraph" class="mb-3" boilerplate />
          <v-skeleton-loader type="button" boilerplate />
        </template>

        <v-alert
          v-if="!selectedCase"
          type="info"
          variant="tonal"
          prominent
          closable
          elevation="2"
          class="custom-alert"
        >
          <v-icon start>mdi-information</v-icon>
          Click on a company to see research details.
        </v-alert>

        <template v-else>
          <v-card elevation="3" class="pa-4">
            <div class="sticky-header">
              <v-card-title class="d-flex justify-space-between align-center">
                <h2>{{ selectedCase.title }}</h2>
                <v-btn color="primary" class="mr-3" variant="flat">Apply Now</v-btn>
              </v-card-title>
              <v-card-subtitle>
                <v-icon>mdi-domain</v-icon> {{ selectedCase.company.Name }} |
                <v-icon>mdi-map-marker</v-icon> {{ selectedCase.company.Address }}
              </v-card-subtitle>
              <v-divider />
            </div>
            <v-card-text>
              <h3>Description</h3>
              <p>{{ selectedCase.description }}</p>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- <script setup>
import { onMounted } from 'vue'
import { useResearchCase } from '@/composables/useResearchCase'

const {
  loading,
  error,
  fetchResearchCases,
  selectedCase,
  selectCompany,
  currentPage,
  paginatedCases,
  totalPages,
} = useResearchCase()

onMounted(() => {
  fetchResearchCases()
})
</script> -->

<script setup>
import { onMounted } from 'vue'
import { useResearchCase } from '@/composables/useResearchCase'

const {
  loading,
  error,
  fetchResearchCases,
  selectedCompany: selectedCase, // Renamed to match template
  selectCompany,
  currentPage,
  paginatedCases,
  totalPages,
} = useResearchCase()

onMounted(() => {
  fetchResearchCases()
})
</script>

<style scoped>
.company-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}
.company-card:hover {
  transform: scale(1.02);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}
.selected-company {
  border: 3px solid #1976d2;
  background-color: #e3f2fd;
}
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding-bottom: 10px;
}
</style>
