<template>
  <Navbar/>
  <v-container class="profile-container mt-13">
    <v-row>
      <!-- Left Column - Profile Picture & Navigation -->
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
            :loading="pending"
            :height="250"
          />

          <v-list density="compact" nav class="profile-nav">
            <template v-for="item in menuItems" :key="item.id">
              <!-- Menu dengan children -->
              <v-list-group v-if="item.children && item.children.length" :value="item.id">
                <template v-slot:activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="item.icon"
                    :title="item.name"
                  ></v-list-item>
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

              <!-- Menu tanpa children -->
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
          ></v-progress-linear>
          <div class="text-caption text-medium-emphasis">{{ profileCompletion }}% lengkap</div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9" lg="8.5" class="pr-md-4">
        <slot />
      </v-col>
    </v-row>

    <!-- Snackbar Notification -->
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
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import Navbar from '@/components/NavBar.vue';
import { ref, computed } from 'vue';
import { useMenu } from '@/composables/useMenu'

const { menu, pending, error } = useMenu()

const menuItems = computed(() => {
  if (!menu.value?.menus) return []
  return menu.value.menus.filter(item => item.is_active)
})

const profileImage = ref(null);
const snackbar = ref(false);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    profileImage.value = URL.createObjectURL(file);
  }
};

const profileCompletion = computed(() => {
  return 100;
});
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

.profile-info-card {
  padding: 32px;
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

.profile-form {
  padding: 8px;
}

.save-button {
  letter-spacing: normal;
  font-weight: 500;
}

.v-text-field {
  margin-bottom: 8px;
}

.v-divider {
  opacity: 0.2;
}
</style>