<template>
  <v-container class="search-container">
    <v-row class="align-center">
      <!-- Input Pencarian -->
      <v-col cols="12" md="5">
        <v-text-field
          v-model="searchQuery"
          @update:modelValue="onSearch"
          variant="outlined"
          density="compact"
          placeholder="Masukkan kata kunci"
          prepend-inner-icon="mdi-magnify"
          hide-details
        />
      </v-col>

      <!-- Pilihan Lokasi -->
      <v-col cols="12" md="3">
        <v-combobox
          v-model="selectedLocation"
          :items="locations"
          clearable
          label="Pilih Lokasi"
          @update:modelValue="onLocationChange"
        />
      </v-col>

      <!-- Pilihan Kategori (Coming Soon) -->
      <v-col cols="12" md="3">
        <v-select
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-briefcase"
          :items="categories"
          v-model="selectedCategory"
          label="Kategori (Coming Soon)"
          disabled
        />
      </v-col>

      <!-- Tombol Pencarian -->
      <v-col cols="12" md="1" class="d-flex justify-center">
        <v-btn icon="mdi-magnify" color="green-accent-4" class="search-btn" @click="onSearch" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useResearchCase } from '@/composables/useResearchCase_old'

const {
  searchQuery,
  selectedLocation,
  setLocationFilter,
  currentPage,
} = useResearchCase()

const locations = ["Semua Lokasi", "Bandung Kota", "Jakarta", "Surabaya", "Yogyakarta"];
const categories = ["Semua Kategori", "IT", "Bisnis", "Desain", "Teknik"];
const selectedCategory = ref('') // Placeholder

const onSearch = () => {
  currentPage.value = 1 // reset halaman
}

const onLocationChange = (val: string) => {
  setLocationFilter(val)
  onSearch()
}
</script>

<style scoped>
.search-container {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 900px;
}

.search-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.v-row {
  align-items: center;
  justify-content: center;
}

.v-col {
  display: flex;
  align-items: center;
}
</style>
