<template>
  <v-card class="profile-card pa-8 rounded-xl elevation-3 conten-card">
    <v-row>
      <v-col cols="12" md="12">
        
          <v-card-title class="text-h5 font-weight-bold mb-2">
            Profile User
          </v-card-title>
          <v-divider class="mb-4"></v-divider>

          <v-form ref="form" class="profile-form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.name"
                  label="Nama Lengkap"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.email"
                  label="Email"
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
                  label="Nomor HP"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.universitas"
                  label="Universitas"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-school"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.program_studi"
                  label="Program Studi"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-book-open"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.semester"
                  label="Semester"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="profile.description"
                  label="Deskripsi Diri"
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
  middleware: 'auth',

});

const profile = ref({
  name: 'Andre Ambatukam',
  email: 'andre404@gmail.com',
  phone: '0812-3456-7890',
  universitas: 'Universitas Indonesia',
  program_studi: 'Ternak Lele',
  semester: '8',
  description: 'Mahasiswa aktif di Universitas Indonesia, program studi Ternak Lele. Memiliki pengalaman dalam pengelolaan usaha ternak lele dan aktif dalam berbagai organisasi kemahasiswaan.',
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
