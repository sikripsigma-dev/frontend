<template>
    <v-container fluid class="py-8 px-4">
      <v-card flat class="pa-6 rounded-xl shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-h5 font-weight-bold">📚 Studi Kasus Terbaru</h2>
          <div class="text-caption text-grey-darken-1 mt-1">Update: {{ formattedDate }}</div>
        </div>
  
        <v-row dense>
          <v-col
            v-for="(item, i) in researchCases"
            :key="i"
            cols="12"
            md="4"
          >
            <v-card
              class="pa-4 rounded-lg transition-ease-in-out hover:scale-[1.01] hover:shadow-md"
              elevation="1"
            >
              <div class="d-flex justify-space-between align-center mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-medium">{{ item.title }}</div>
                  <div class="text-caption text-grey-darken-1">{{ item.company }} • {{ item.location }}</div>
                </div>
                <v-chip
                  v-if="item.isNew"
                  color="pink"
                  size="x-small"
                  text-color="white"
                  class="font-weight-bold"
                >
                  BARU
                </v-chip>
              </div>
  
              <div class="d-flex flex-wrap gap-2 my-2">
                <v-chip
                  v-for="(tag, j) in item.tags"
                  :key="j"
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="text-caption"
                >
                  {{ tag }}
                </v-chip>
              </div>
  
              <div class="d-flex justify-end">
                <v-btn
                  size="small"
                  color="green-darken-1"
                  class="text-white"
                  variant="flat"
                  rounded="md"
                >
                  Lihat Detail
                  <v-icon end size="18">mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const researchCases = ref([
    {
      title: 'Analisis Perilaku Konsumen Pasca Pandemi',
      company: 'Sociolla',
      location: 'Jakarta',
      tags: ['Remote', 'Marketing', 'Skripsi'],
      isNew: true,
    },
    {
      title: 'Sistem Rekomendasi Makanan Lokal',
      company: 'Traveloka',
      location: 'Bandung',
      tags: ['AI', 'Machine Learning', 'Pariwisata'],
      isNew: true,
    },
    {
      title: 'Prediksi Risiko Kredit Mahasiswa',
      company: 'Bank BRI',
      location: 'Surabaya',
      tags: ['Fintech', 'Data Mining'],
      isNew: false,
    },
    {
      title: 'Deteksi Dini Stres Akademik',
      company: 'Riliv',
      location: 'Remote',
      tags: ['Psikologi', 'Survey'],
      isNew: false,
    },
  ])
  
  const formattedDate = new Date().toISOString().split('T')[0]
  </script>
  
  <style scoped>
  .gap-2 {
    gap: 8px;
  }
  </style>
  