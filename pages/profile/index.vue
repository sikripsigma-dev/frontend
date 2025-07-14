<template>
  <v-card class="profile-card pa-8 rounded-xl elevation-3 conten-card">
    <v-row>
      <v-col cols="12" md="12">
        <v-card-title class="text-h5 font-weight-bold mb-2">
          Profile User
        </v-card-title>
        <v-divider class="mb-4" />

        <v-form ref="form" class="profile-form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.email"
                label="Email"
                placeholder="Masukkan email"
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
                placeholder="Masukkan nomor HP"
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
                placeholder="Tulis deskripsi singkat..."
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
              :disabled="!isProfileChanged || loadingSave"
              @click="saveProfile"
            >
              <v-icon start>mdi-content-save</v-icon>
              Simpan Perubahan
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-card>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    timeout="3000"
    location="bottom right"
  >
    <div class="d-flex align-center">
      <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
      <span>{{ snackbar.message }}</span>
    </div>
    <template #actions>
      <v-btn variant="text" @click="snackbar.visible = false">Tutup</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDataUser } from '@/composables/useDataUser';

definePageMeta({
  layout: "profile",
});

const { user, refresh } = useDataUser();

const profile = ref({
  name: '',
  email: '',
  phone: '',
  universitas: '',
  program_studi: '',
  semester: '',
  description: '',
});
const originalProfile = ref({});
const loadingSave = ref(false);

const snackbar = ref({
  visible: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
});

const initProfile = (userData) => {
  const data = {
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    universitas: userData.universitas || '',
    program_studi: userData.program_studi || '',
    semester: userData.semester || '',
    description: userData.description || '',
  };
  profile.value = data;
  originalProfile.value = JSON.parse(JSON.stringify(data));
};

watch(
  () => user.value,
  (userData) => {
    if (userData) {
      initProfile(userData);
    }
  },
  { immediate: true }
);

const isProfileChanged = computed(() => {
  return JSON.stringify(profile.value) !== JSON.stringify(originalProfile.value);
});

const saveProfile = async () => {
  loadingSave.value = true;
  try {
    const config = useRuntimeConfig();
    await $fetch(`${config.public.apiBase}/api/profile`, {
      method: 'PUT',
      body: profile.value,
      credentials: 'include',
    });
    Object.assign(originalProfile.value, JSON.parse(JSON.stringify(profile.value)));
    snackbar.value = {
      visible: true,
      message: 'Profil berhasil diperbarui!',
      color: 'success',
      icon: 'mdi-check-circle',
    };
    refresh(); // Refresh data user
  } catch (err) {
    snackbar.value = {
      visible: true,
      message: 'Gagal memperbarui profil!',
      color: 'error',
      icon: 'mdi-alert-circle',
    };
  } finally {
    loadingSave.value = false;
  }
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
