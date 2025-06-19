<template>
    <v-container fluid class="hero-section py-16 px-4 text-center" style="position: relative; overflow: hidden;">
      <!-- Background blobs -->
      <svg class="blob top-left" viewBox="0 0 200 200">
        <path fill="#E3F2FD" d="M47.8,-58.6C60.5,-47.2,68.9,-30.8,69.7,-14.9C70.6,1,63.9,16.5,55.5,31.4C47.1,46.4,36.9,60.9,22.8,65.4C8.7,70,-9.2,64.6,-25.1,56.3C-41,48.1,-54.9,36.9,-63.3,21.8C-71.8,6.8,-74.8,-12.1,-66.5,-26.5C-58.2,-40.9,-38.7,-50.7,-20.1,-59.2C-1.5,-67.7,16.1,-74.9,31.6,-70.2C47.1,-65.4,59.2,-48.5,47.8,-58.6Z" transform="translate(100 100)" />
      </svg>
  
      <svg class="blob bottom-right" viewBox="0 0 200 200">
        <path fill="#FFF3E0" d="M40.8,-55.7C54.5,-48.6,68.6,-39.2,72.7,-26.3C76.9,-13.5,71.2,2.8,65.2,19.1C59.2,35.4,52.9,51.7,40.6,60.4C28.4,69.1,10.2,70.2,-5.8,66.7C-21.8,63.2,-35.5,55,-47.7,44.1C-60,33.2,-70.8,19.6,-71.2,5.2C-71.6,-9.2,-61.7,-23.3,-51,-36.8C-40.3,-50.3,-28.7,-63.3,-14.1,-66.3C0.6,-69.2,24.3,-62.8,40.8,-55.7Z" transform="translate(100 100)" />
      </svg>
  
      <!-- Hero Content -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold mb-3">
            🎓 Skripsi Gak Perlu Bingung Lagi!
          </h1>
          <p class="text-body-1 mb-2">
            Skripsigma bantu kamu menemukan <strong>studi kasus skripsi</strong> dari perusahaan asli di Indonesia 🧳
          </p>
          <p class="text-body-1 mb-6">
            Terhubung langsung ke <strong>+150 studi kasus aktif</strong> dari berbagai sektor industri.
          </p>
          <v-text-field
            prepend-inner-icon="mdi-email"
            placeholder="Masukkan email kampusmu"
            outlined
            rounded
            class="mx-auto mb-4"
            style="max-width: 400px;"
          />
          <v-btn color="primary" rounded large>
            🚀 Daftar Sekarang
          </v-btn>
          <p class="mt-4 text-caption">
            Sudah <strong>12.000+</strong> mahasiswa bergabung — 
            <a href="#" class="text-decoration-none font-weight-medium" target="_blank">
              Download Panduan Skripsi Gratis 📘
            </a>
          </p>
        </v-col>
      </v-row>
    </v-container>
    <v-container>
        <!-- <SearchBar/> -->
        <SearchBar v-model="searchQuery" :location="selectedLocation" />
    </v-container> 
    <v-container>
        <!-- <ResearchCaseList/> -->
        <ResearchCaseList
          :items="paginatedCases"
          :loading="loading"
          :total-pages="totalPages"
          :current-page="currentPage"
        />
    </v-container> 
  </template>


<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
import ResearchCaseList from '@/components/ResearchCaseList.vue'
import { useResearchCase } from '@/composables/useResearchCase'

const {
  searchQuery,
  selectedLocation,
  paginatedCases,
  loading,
  currentPage,
  totalPages,
  fetchResearchCases,
} = useResearchCase()

onMounted(() => {
  fetchResearchCases()
})
</script>

<style scoped>
.hero-section {
  background-color: #fefefe;
  position: relative;
}
.blob {
  position: absolute;
  width: 300px;
  height: 300px;
  z-index: 0;
  opacity: 0.4;
}
.blob.top-left {
  top: -100px;
  left: -100px;
}
.blob.bottom-right {
  bottom: -100px;
  right: -100px;
}
</style>
  