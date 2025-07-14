<template>
  <Navbar />
  <v-container class="profile-container mt-13">
    <v-row>
      <v-col cols="12" md="3" class="pr-md-4">
        <v-card class="profile-card mb-4" elevation="2">
          <div class="profile-picture-container">
            <v-avatar size="150" class="profile-avatar">
              <v-img v-if="profileImage" :src="profileImage" alt="Profile" />
              <v-icon v-else size="80" color="grey lighten-1">mdi-account-circle</v-icon>
            </v-avatar>
            <v-file-input 
              label="Ganti Foto Profil" 
              accept="image/*" 
              prepend-icon="mdi-camera"
              class="mt-3 photo-upload"
              variant="outlined"
              density="comfortable"
              hide-details
              @change="handleFileUpload" />
          </div>

          <v-divider class="my-4"></v-divider>

          <v-skeleton-loader
            v-if="pending"
            type="list-item-three-line"
            class="ma-2"
            :height="250"
          />

          <v-list density="compact" nav class="profile-nav">
            <template v-for="item in menuItems" :key="item.id">
              <v-list-group v-if="item.children && item.children.length" :value="item.id">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.name" />
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.id"
                  :prepend-icon="child.icon"
                  :title="child.name"
                  :to="`/profile/${child.url}`"
                  link
                  class="pl-8"
                />
              </v-list-group>
              <v-list-item
                v-else
                :prepend-icon="item.icon"
                :title="item.name"
                :to="`/profile/${item.url}`"
                link
              />
            </template>
          </v-list>
        </v-card>

        <v-card class="completion-card" elevation="2">
          <v-card-title class="text-subtitle-1 font-weight-medium">Kelengkapan Profil</v-card-title>
          <v-progress-linear
            :model-value="profileCompletion"
            color="primary"
            height="8"
            class="mb-2"
          />
          <div class="text-caption text-medium-emphasis">{{ profileCompletion }}% lengkap</div>
        </v-card>
      </v-col>

      <!-- <v-col cols="12" md="9" lg="8.5" class="pr-md-4"> -->
      <v-col cols="12" md="9" lg="8.5" class="pl-md-4 pr-md-4">
        <div v-if="profileLoaded">
          <slot />
        </div>
        <div v-else>
          <v-skeleton-loader type="card" class="ma-2" :height="400" />
        </div>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      location="bottom right"
      timeout="3000"
      color="success"
      elevation="24"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-check-circle" class="me-2"></v-icon>
        <span>Profil berhasil diperbarui!</span>
      </div>
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import Navbar from '@/components/NavBar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useMenu } from '@/composables/useMenu';
import { useDataUser } from '@/composables/useDataUser';

const router = useRouter();
const config = useRuntimeConfig();

const profileLoaded = ref(false);
const profileImage = ref<string | null>(null);
const snackbar = ref(false);

interface User {
  image?: string;
  // add other properties as needed
}
const { uploadProfilePhoto, user, refresh } = useDataUser() as {
  uploadProfilePhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: any }>;
  user: Ref<User | null>;
  refresh: () => Promise<void>;
};
const { menu, pending } = useMenu();

const menuItems = computed(() => {
  const menus = (menu.value && Array.isArray((menu.value as any).menus)) ? (menu.value as any).menus : [];
  return menus.filter((item: any) => item.is_active);
});

onMounted(async () => {
  try {
    await refresh();
    if (user.value?.image) {
      // profileImage.value = `${config.public.apiBase}${user.value.image}`;
      profileImage.value = `${config.public.apiBase}${user.value?.image}?t=${Date.now()}`; 
    }
    profileLoaded.value = true;
  } catch {
    router.push('/login');
  }
});


const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const result = await uploadProfilePhoto(file);
  if (result.success && result.url) {
    profileImage.value = `${config.public.apiBase}${result.url}`;
    snackbar.value = true;
  } else {
    // console.error('Upload gagal', result.error);
  }
};

const profileCompletion = computed(() => 100);
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 32px;
}
.profile-card {
  padding: 24px;
  border-radius: 12px;
}
.profile-picture-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-avatar {
  border: 3px solid rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}
.photo-upload {
  width: 100%;
}
.profile-nav {
  padding: 0;
}
.active-nav-item {
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
.completion-card {
  padding: 16px;
  border-radius: 12px;
}
</style>