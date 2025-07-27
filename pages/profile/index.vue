<template>
  <v-card class="profile-card pa-8 rounded-xl elevation-3 conten-card">
    <v-row>
      <v-col cols="12">
        <v-card-title class="text-h5 font-weight-bold mb-2">Profile User</v-card-title>
        <v-divider class="mb-4" />

        <v-form ref="form" class="profile-form">
          <v-row>
            <v-col
              v-for="field in fieldsToShow"
              :key="field.key"
              :cols="12"
              :md="field.textarea ? 12 : 6"
            >
              <component
                :is="field.textarea ? 'v-textarea' : 'v-text-field'"
                v-model="profile[field.key]"
                :label="field.label"
                :type="field.type || 'text'"
                variant="outlined"
                density="comfortable"
                :prepend-inner-icon="field.icon"
                :auto-grow="field.textarea || undefined"
                :rows="field.textarea ? 3 : undefined"
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
  layout: 'profile',
});

const { user, refresh } = useDataUser();

const profile = ref({
  name: '',
  email: '',
  phone: '',
  division: '',
  nim: '',
  jurusan: '',
  gpa: '',
  university: '',
  linkedin: '',
  nidn: '',
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

const role = computed(() => user.value?.role || 1);

// Mapping field per role
const profileFieldsByRole = {
  1: [ // Admin
    { key: 'name', label: 'Nama Lengkap', icon: 'mdi-account' },
    { key: 'email', label: 'Email', icon: 'mdi-email', type: 'email' },
    { key: 'phone', label: 'Nomor HP', icon: 'mdi-phone' },
  ],
  2: [ // Company
    { key: 'name', label: 'Nama Lengkap', icon: 'mdi-account' },
    { key: 'email', label: 'Email', icon: 'mdi-email', type: 'email' },
    { key: 'phone', label: 'Nomor HP', icon: 'mdi-phone' },
    { key: 'division', label: 'Divisi', icon: 'mdi-office-building' },
  ],
  3: [ // Student
    { key: 'name', label: 'Nama Lengkap', icon: 'mdi-account' },
    { key: 'email', label: 'Email', icon: 'mdi-email', type: 'email' },
    { key: 'phone', label: 'Nomor HP', icon: 'mdi-phone' },
    { key: 'nim', label: 'NIM', icon: 'mdi-card-account-details' },
    { key: 'jurusan', label: 'Program Studi', icon: 'mdi-book-open' },
    { key: 'gpa', label: 'IPK', icon: 'mdi-star-circle' },
    { key: 'university', label: 'Universitas/Institusi', icon: 'mdi-school' },
    { key: 'linkedin', label: 'Linkedin', icon: 'mdi-linkedin' },
    { key: 'description', label: 'Deskripsi Diri', icon: 'mdi-text', textarea: true },
  ],
  4: [ // Supervisor
    { key: 'name', label: 'Nama Lengkap', icon: 'mdi-account' },
    { key: 'email', label: 'Email', icon: 'mdi-email', type: 'email' },
    { key: 'phone', label: 'Nomor HP', icon: 'mdi-phone' },
    { key: 'nidn', label: 'NIDN', icon: 'mdi-card-account-details' },
  ],
};

const fieldsToShow = computed(() => profileFieldsByRole[role.value] || []);

const initProfile = (userData) => {
  const base = {
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
  };

  switch (userData.role) {
    case 2: // company
      Object.assign(profile.value, {
        ...base,
        division: userData.company?.division || '',
      });
      break;
    case 3: // student
      Object.assign(profile.value, {
        ...base,
        nim: userData.Student?.nim || '',
        jurusan: userData.Student?.jurusan || '',
        gpa: userData.Student?.gpa || '',
        university: userData.Student?.univ_name || '',
        linkedin: userData.Student?.linkedin || '',
        description: userData.description || '',
      });
      break;
    case 4: // supervisor
      Object.assign(profile.value, {
        ...base,
        nidn: userData.Supervisor?.nidn || '',
      });
      break;
    default:
      Object.assign(profile.value, base);
  }

  originalProfile.value = JSON.parse(JSON.stringify(profile.value));
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
    originalProfile.value = JSON.parse(JSON.stringify(profile.value));
    snackbar.value = {
      visible: true,
      message: 'Profil berhasil diperbarui!',
      color: 'success',
      icon: 'mdi-check-circle',
    };
    refresh();
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
.profile-card {
  padding: 24px;
  border-radius: 12px;
}
</style>
