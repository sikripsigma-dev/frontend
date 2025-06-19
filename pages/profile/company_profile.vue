<template>
    <v-card class="profile-card pa-8 rounded-xl elevation-3 conten-card">
      <v-row>
        <v-col cols="12" md="12">
          
            <v-card-title class="text-h5 font-weight-bold mb-2">
              🏢 Profil Perusahaan
            </v-card-title>
            <v-divider class="mb-4"></v-divider>
  
            <v-form ref="form" class="profile-form">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.name"
                    label="Nama Perusahaan"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-domain"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.email"
                    label="Email Kontak"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-email"
                    type="email"
                  />
                </v-col>
              </v-row>
  
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.phone"
                    label="Nomor Telepon"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.address"
                    label="Alamat Perusahaan"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker"
                  />
                </v-col>
              </v-row>
  
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.industry"
                    label="Bidang Industri"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-briefcase"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.size"
                    label="Ukuran Perusahaan"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-group"
                    placeholder="Contoh: 51-200 karyawan"
                  />
                </v-col>
              </v-row>
  
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="profile.description"
                    label="Deskripsi Perusahaan"
                    variant="outlined"
                    rows="3"
                    auto-grow
                    prepend-inner-icon="mdi-text"
                  />
                </v-col>
              </v-row>
  
              <div class="d-flex justify-end mt-4">
                <v-btn
                  variant="flat"
                  color="primary"
                  size="large"
                  :disabled="!isProfileChanged"
                  @click="saveProfile"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  Simpan Perubahan
                </v-btn>
              </div>
            </v-form>
          <!-- <v-card class="profile-info-card pa-8 rounded-xl elevation-3 conten-card">
          </v-card> -->
        </v-col>
      </v-row>
    </v-card>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  definePageMeta({
    layout: "profile",
  });
  
  const profile = ref({
    name: 'PT Skripsigma Teknologi',
    email: 'hrd@skripsigma.com',
    phone: '021-8888-1234',
    address: 'Jl. Teknologi No. 88, Jakarta',
    industry: 'Teknologi Pendidikan',
    size: '51-200 karyawan',
    description: 'Kami adalah perusahaan yang menyediakan studi kasus skripsi nyata dari industri untuk mahasiswa Indonesia.'
  });
  
  const originalProfile = { ...profile.value };
  
  const isProfileChanged = computed(() => {
    return JSON.stringify(profile.value) !== JSON.stringify(originalProfile);
  });
  
  const saveProfile = () => {
    Object.assign(originalProfile, profile.value);
    // Tambahkan notifikasi sukses di sini
  };
  </script>
  
  <style scoped>
  .profile-info-card {
    padding: 32px;
    border-radius: 12px;
  }
  
  .profile-card {
    padding: 24px;
    border-radius: 12px;
  }
  </style>
  