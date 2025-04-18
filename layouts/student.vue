<template>
  <Navbar />
  <v-container class="mt-13">
    <v-row>
      <!-- Sidebar -->
      <v-col cols="12" md="3" lg="3.5">
        <v-card class="pa-5 rounded-xl elevation-4 sidebar-card">
          <div class="text-center">
            <v-avatar size="100" class="mb-4 bg-primary">
              <v-icon size="55" color="white">mdi-account</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold">Andre Ambatukam</h3>
            <p class="text-subtitle-2 text-grey-darken-1">Mahasiswa - Universitas Ngawi</p>
          </div>
          <v-divider class="my-4" />

          <v-alert type="warning" variant="tonal" class="mb-4 rounded-lg pa-3 d-flex align-center">
            <div>
              <span class="text-body-2">Lengkapi profil untuk mendaftar ke program</span>
              <v-btn variant="text" color="primary" class="ml-1 text-caption">Lengkapi Profil</v-btn>
            </div>
          </v-alert>

          <v-list nav density="comfortable">
            <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" class="rounded-lg menu-item">
              <template v-slot:prepend>
                <v-icon>{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Konten Dinamis -->
      <v-col cols="12" md="9" lg="8.5">
        <v-card class="pa-8 rounded-xl elevation-3 content-card">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import Navbar from '@/components/NavBar.vue';
import { ref } from 'vue';

const menuItems = ref([
  { title: 'Profil Saya', icon: 'mdi-account', to: '/student' },
  { title: 'Notifikasi', icon: 'mdi-bell', to: '/student/notifications' },
  { title: 'Riwayat Pendaftaran', icon: 'mdi-history', to: '/student/history' },
  { title: 'Chat', icon: 'mdi-chat', to: '/student/chat' },
  { title: 'Bantuan & Dukungan', icon: 'mdi-help-circle', to: '/student/support' },
  { title: 'Keluar', icon: 'mdi-logout', to: '/logout', class: 'text-red-darken-2' }
]);
</script>

<style scoped>
.v-container {
  margin-top: 64px;
}
.sidebar-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s;
  padding-bottom: 20px;
}
.sidebar-card:hover {
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.1);
}
.menu-item {
  padding: 14px;
  transition: background-color 0.3s;
  border-radius: 10px;
  font-weight: 500;
}
.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.active-menu {
  background-color: #6200ea !important;
  color: white !important;
  font-weight: bold;
}
.content-card {
  background: #ffffff;
  border-radius: 12px;
  transition: box-shadow 0.3s;
}
.content-card:hover {
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.1);
}
</style>
