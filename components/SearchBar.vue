<template>
  <v-container class="search-container">
    <v-row class="align-center">
      <!-- Input Pencarian -->
      <v-col cols="12" md="5">
        <v-text-field
          variant="outlined"
          density="compact"
          placeholder="Masukkan kata kunci"
          prepend-inner-icon="mdi-magnify"
          hide-details
        ></v-text-field>
      </v-col>

      <!-- Pilihan Lokasi -->
      <v-col cols="12" md="3">
        <v-combobox
          v-model="store.selectedLocation"
          :items="locations"
          clearable
          label="Select or Type Location"
          @update:modelValue="store.setLocationFilter"
        />
      </v-col>

      <!-- Pilihan Kategori -->
      <v-col cols="12" md="3">
        <v-select
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-briefcase"
          :items="categories"
          v-model="store.selectedCategory"
          :menu-props="{ location: 'bottom' }"
        ></v-select>
      </v-col>

      <!-- Tombol Pencarian -->
      <v-col cols="12" md="1" class="d-flex justify-center">
        <v-btn icon="mdi-magnify" color="green-accent-4" class="search-btn"></v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { useResearchCasesStore } from "@/stores/researchCases";

const store = useResearchCasesStore();
const locations = ["Semua Lokasi", "Bandung Kota", "Jakarta", "Surabaya", "Yogyakarta"];
const categories = ["Semua Kategori", "IT", "Bisnis", "Desain", "Teknik"];
</script>

<style scoped>
.search-container {
  background: white;
  padding: 20px; /* Menambah padding agar lebih lapang */
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
  align-items: center; /* Pastikan item sejajar di tengah */
  justify-content: center;
}

.v-col {
  display: flex;
  align-items: center;
}
</style>
