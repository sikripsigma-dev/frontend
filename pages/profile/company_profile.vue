<template>
  <v-card class="profile-card pa-8 rounded-xl elevation-3 conten-card">
    <v-row>
      <v-col cols="12">
        <v-card-title class="text-h5 font-weight-bold mb-2">
          Profil Perusahaan
        </v-card-title>
        <v-divider class="mb-4" />

        <v-form ref="form" class="profile-form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="profile.name" label="Nama Perusahaan" variant="outlined" density="comfortable" prepend-inner-icon="mdi-domain" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="profile.email" label="Email Kontak" variant="outlined" density="comfortable" prepend-inner-icon="mdi-email" type="email" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="profile.phone" label="Nomor Telepon" variant="outlined" density="comfortable" prepend-inner-icon="mdi-phone" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="profile.address" label="Alamat Perusahaan" variant="outlined" density="comfortable" prepend-inner-icon="mdi-map-marker" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea v-model="profile.description" label="Deskripsi Perusahaan" variant="outlined" rows="3" auto-grow prepend-inner-icon="mdi-text" />
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-4">
            <v-btn variant="flat" color="primary" size="large" :disabled="!isProfileChanged || pending" @click="saveProfile">
              <v-icon start>mdi-content-save</v-icon>
              Simpan Perubahan
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-card>

  <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000" location="bottom right">
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
import { useDataCompany } from '@/composables/useDataCompany';

definePageMeta({
  layout: 'profile',
});

const { user } = useDataUser();
const { company, pending, fetchCompany, updateCompany } = useDataCompany();

const profile = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
});
const originalProfile = ref({});
const companyId = ref('');

const snackbar = ref({
  visible: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
});

const isProfileChanged = computed(() => {
  return JSON.stringify(profile.value) !== JSON.stringify(originalProfile.value);
});

watch(
  () => user.value,
  (userData) => {
    if (userData?.user?.role === 2 && userData.user.company?.id) {
      companyId.value = userData.user.company.id;
      fetchCompany(companyId.value);
    }
  },
  { immediate: true }
);

watch(
  () => company.value,
  (val) => {
    if (val) {
      profile.value = {
        name: val.Name || '',
        email: val.Email || '',
        phone: val.Phone || '',
        address: val.Address || '',
        description: val.Description || '',
      };
      originalProfile.value = JSON.parse(JSON.stringify(profile.value));
    }
  },
  { immediate: true }
);

const saveProfile = async () => {
  const { success } = await updateCompany(companyId.value, profile.value);
  if (success) {
    originalProfile.value = JSON.parse(JSON.stringify(profile.value));
    snackbar.value = {
      visible: true,
      message: 'Profil perusahaan berhasil diperbarui!',
      color: 'success',
      icon: 'mdi-check-circle',
    };
  } else {
    snackbar.value = {
      visible: true,
      message: 'Gagal memperbarui profil perusahaan!',
      color: 'error',
      icon: 'mdi-alert-circle',
    };
  }
};
</script>

<style scoped>
.profile-card {
  padding: 24px;
  border-radius: 12px;
}
</style>
