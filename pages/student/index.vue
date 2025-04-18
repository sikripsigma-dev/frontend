<template>
  <v-container class="mt-6">
    <v-row>
      <!-- Foto Profil -->
      <v-col cols="12" md="4" class="text-center">
        <v-card class="pa-4 rounded-lg elevation-3">
          <v-avatar size="120" class="mb-3">
            <v-img v-if="profileImage" :src="profileImage" alt="Profile" />
            <v-icon v-else size="80" color="grey">mdi-account</v-icon>
          </v-avatar>
          <v-file-input 
            label="Ganti Foto" 
            accept="image/*" 
            prepend-icon="mdi-camera"
            class="mt-2" 
            variant="outlined"
            @change="handleFileUpload" />
        </v-card>
      </v-col>
      
      <!-- Informasi Mahasiswa -->
      <v-col cols="12" md="8">
        <v-card class="pa-6 rounded-lg elevation-3">
          <v-card-title class="text-h5 font-weight-bold">Profil Mahasiswa</v-card-title>
          <v-divider class="mb-4"></v-divider>
          <v-form ref="form">
            <v-text-field v-model="profile.name" label="Nama Lengkap" outlined dense></v-text-field>
            <v-text-field v-model="profile.email" label="Email" outlined dense></v-text-field>
            <v-text-field v-model="profile.phone" label="Nomor HP" outlined dense></v-text-field>
            <v-text-field v-model="profile.university" label="Universitas" outlined dense disabled></v-text-field>
            <v-text-field v-model="profile.major" label="Program Studi" outlined dense disabled></v-text-field>
            <v-text-field v-model="profile.semester" label="Semester" outlined dense disabled></v-text-field>
            <v-btn :disabled="!isProfileChanged" color="primary" class="mt-3" @click="saveProfile">Simpan Perubahan</v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar Notifikasi -->
    <v-snackbar v-model="snackbar" timeout="3000" color="success">Profil berhasil diperbarui!</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({
  layout: "student",
});

const profile = ref({
  name: 'Ataline Jeanethe Maya Hukubun',
  email: 'ataline@example.com',
  phone: '0812-3456-7890',
  university: 'Universitas Negeri Manado',
  major: 'Teknik Informatika',
  semester: 'Semester 6'
});

const originalProfile = { ...profile.value };
const profileImage = ref(null);
const snackbar = ref(false);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    profileImage.value = URL.createObjectURL(file);
  }
};

const isProfileChanged = computed(() => {
  return JSON.stringify(profile.value) !== JSON.stringify(originalProfile);
});

const saveProfile = () => {
  snackbar.value = true;
  Object.assign(originalProfile, profile.value);
};
</script>

<style scoped>
.v-card {
  transition: box-shadow 0.3s ease-in-out;
}
.v-card:hover {
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
}
.v-btn {
  text-transform: none;
}
</style>
