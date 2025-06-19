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
            :items="studiKasusList"
            :items-per-page="5"
            class="elevation-0"
            density="comfortable"
            item-value="id"
          >
            <template #item.status="{ item }">
              <v-chip :color="item.status === 'Aktif' ? 'green' : 'grey'" variant="tonal" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-1 justify-center">
                <v-btn icon size="small" @click="lihatDetail(item)" variant="tonal">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon size="small" color="primary" @click="editStudiKasus(item)" variant="tonal">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" color="error" @click="hapusStudiKasus(item)" variant="tonal">
                  <v-icon>mdi-delete</v-icon>
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
  </v-container>
</template>
<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'profile',
})

const headers = [
  { title: 'Judul', key: 'judul', sortable: true },
  { title: 'Divisi', key: 'divisi', sortable: true },
  { title: 'Tanggal Dibuat', key: 'tanggal', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false },
]

const studiKasusList = ref([
  {
    id: 1,
    judul: 'Analisis Risiko Kredit',
    divisi: 'Manajemen Risiko',
    tanggal: '2025-06-10',
    status: 'Aktif',
  },
  {
    id: 2,
    judul: 'Prediksi Permintaan Produk',
    divisi: 'Pemasaran',
    tanggal: '2025-06-05',
    status: 'Tidak Aktif',
  },
])

const tambahStudiKasus = () => {
  // navigasi ke form tambah
}

const lihatDetail = (item) => {
  // navigasi ke detail
}

const editStudiKasus = (item) => {
  // navigasi ke form edit
}

const hapusStudiKasus = (item) => {
  // konfirmasi hapus
}
</script>

<style scoped>
.gap-1 > * {
  margin-right: 4px;
}
</style>

