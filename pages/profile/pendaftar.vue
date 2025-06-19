<template>
    <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
      <v-row no-gutters class="fill-height">
        <v-col
          cols="12"
          class="mx-auto px-4 py-6"
          style="width: 100%; max-width: 960px; box-sizing: border-box;"
        >
          <v-card elevation="2" rounded="lg">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-h6 font-weight-bold">List Pendaftar</span>
            </v-card-title>
  
            <v-divider />
  
            <v-data-table
              :headers="headers"
              :items="pendaftarList"
              :items-per-page="5"
              class="elevation-0 min-width-table"
              density="comfortable"
              item-value="id"
            >
              <template #item.status="{ item }">
                <v-chip
                  :color="statusColor(item.status)"
                  variant="tonal"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>
  
              <template #item.actions="{ item }">
                <div class="d-flex gap-1 justify-center">
                  <v-btn icon size="small" @click="lihatDetail(item)" variant="tonal">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="success"
                    @click="terimaPendaftar(item)"
                    variant="tonal"
                  >
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    @click="tolakPendaftar(item)"
                    variant="tonal"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </template>
  
              <template #no-data>
                <v-alert type="info" border="start" variant="tonal" class="ma-4">
                  Belum ada pendaftar yang masuk.
                </v-alert>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  definePageMeta({
    layout: 'profile',
  })
  
  const headers = [
    { title: 'Nama', key: 'nama', sortable: true },
    { title: 'Studi Kasus', key: 'case', sortable: true },
    { title: 'Email', key: 'email', sortable: false },
    { title: 'Jurusan', key: 'jurusan', sortable: true },
    { title: 'Universitas', key: 'universitas', sortable: true },
    { title: 'Tanggal Daftar', key: 'tanggal_daftar', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Aksi', key: 'actions', sortable: false },
  ]
  
  const pendaftarList = ref([
    {
      id: 1,
      nama: 'Aditya Ramadhan',
      case: 'Audit Sistem Perbankan',
      email: 'aditya@email.com',
      jurusan: 'Teknik Informatika',
      universitas: 'Universitas Indonesia',
      tanggal_daftar: '2025-06-10',
      status: 'Menunggu',
    },
    {
      id: 2,
      nama: 'Salsa Ayu',
      case: 'Analisis Data Penjualan Koperasi',
      email: 'salsa@email.com',
      jurusan: 'Manajemen',
      universitas: 'Universitas Gadjah Mada',
      tanggal_daftar: '2025-06-11',
      status: 'Diterima',
    },
  ])
  
  const statusColor = (status) => {
    switch (status) {
      case 'Diterima':
        return 'green'
      case 'Ditolak':
        return 'red'
      default:
        return 'grey'
    }
  }
  
  const lihatDetail = (item) => {
    console.log('Lihat detail:', item)
  }
  
  const terimaPendaftar = (item) => {
    item.status = 'Diterima'
  }
  
  const tolakPendaftar = (item) => {
    item.status = 'Ditolak'
  }
  </script>
  
  <style scoped>
  .gap-1 > * {
    margin-right: 4px;
  }
  .fill-height {
    height: 100vh;
  }
  </style>
  