<template>
  <v-app-bar app elevation="1" color="white" height="60" class="px-4 border-bottom">
    <v-container class="pa-0 fill-height d-flex align-center">
      <!-- Logo -->
      <router-link to="/" class="d-flex align-center text-decoration-none">
        <div class="logo-dummy mr-3"></div>
        <span class="text-h5 font-weight-bold text-green-accent-4">Skripsigma</span>
      </router-link>

      <v-spacer />

      <!-- Desktop Menu -->
      <div class="d-none d-md-flex align-center">
        <router-link
          v-for="(item, i) in menuItems"
          :key="i"
          :to="item.to"
          class="nav-item"
          active-class="active-nav"
        >
          {{ item.title }}
        </router-link>
      </div>

      <v-spacer />

      <!-- User Actions -->
      <div class="d-none d-md-flex align-center">
        <template v-if="authLoading">
          <v-skeleton-loader type="avatar" class="mr-2" />
        </template>

        <template v-else>
          <v-menu v-if="isLoggedIn" offset-y>
            <template #activator="{ props }">
              <v-btn icon v-bind="props">
                <v-avatar size="40">
                  <v-img :src="userPhoto" />
                </v-avatar>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(item, index) in userMenuItems"
                :key="index"
                :to="item.to"
                @click="drawer = false"
                class="px-4"
              >
                <v-list-item-title>
                  <v-icon start size="18">{{ item.icon }}</v-icon>
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="handleLogout" class="px-4">
                <v-list-item-title>
                  <v-icon start size="18">mdi-logout</v-icon>
                  Logout
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn v-else color="green-accent-4" to="/login" class="text-white">Login</v-btn>
        </template>
      </div>

      <!-- Mobile Menu Icon -->
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
    </v-container>
  </v-app-bar>

  <!-- Mobile Drawer -->
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item
        v-for="(item, i) in menuItems"
        :key="i"
        :to="item.to"
        @click="drawer = false"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2" />

      <template v-if="isLoggedIn">
        <v-list-item
          v-for="(item, index) in userMenuItems"
          :key="'mobile-' + index"
          :to="item.to"
          @click="drawer = false"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleLogout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </template>

      <template v-else>
        <v-list-item to="/login" @click="drawer = false">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const drawer = ref(false);
const router = useRouter();
const { user, isLoggedIn, authLoading, fetchUser, logout } = useAuth();

const userPhoto = computed(() => user.value?.photo || 'https://i.pravatar.cc/150?img=3');

const menuItems = [
  { title: 'Home', to: '/' },
  { title: 'Company', to: '/company' },
  { title: 'Case', to: '/research_case' },
];

const userMenuItems = [
  { title: 'Profile', to: '/profile', icon: 'mdi-account-circle-outline' },
  { title: 'Settings', to: '/settings', icon: 'mdi-cog-outline' },
];

const handleLogout = () => {
  logout();
  router.push('/login');
};

onMounted(async () => {
  if (!user.value) {
    await fetchUser();
  }
});
</script>

<style scoped>
.nav-item {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  padding: 10px 16px;
  position: relative;
  transition: color 0.2s ease-in-out;
}

.nav-item:hover {
  color: #00C853;
}

.active-nav {
  color: #00C853;
  font-weight: 600;
}

.active-nav::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -8px;
  width: 60%;
  height: 2px;
  background-color: #00C853;
}
</style>
