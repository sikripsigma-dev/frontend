<template>
  <!-- Navbar -->
  <v-app-bar app elevation="1" color="white" height="60" class="px-4 border-bottom">
    <v-container class="pa-0 fill-height d-flex align-center">
      <!-- Logo -->
      <router-link to="/" class="d-flex align-center text-decoration-none">
        <div class="logo-dummy mr-3"></div>
        <span class="text-h5 font-weight-bold text-green-accent-4">Skripsigma</span>
      </router-link>

      <v-spacer></v-spacer>

      <!-- Desktop Navigation -->
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

      <v-spacer></v-spacer>

      <!-- User Actions -->
      <div class="d-flex align-center">
        <v-btn v-if="isLoggedIn" icon>
          <v-avatar size="40">
            <v-img v-if="userPhoto" :src="userPhoto"></v-img>
            <v-img v-else src="https://i.pravatar.cc/150?img=3"></v-img>
          </v-avatar>
        </v-btn>

        <!-- Jika belum login, tampilkan tombol Login -->
        <v-btn v-else color="green-accent-4" to="/login">Login</v-btn>
      </div>

      <!-- Mobile Menu Button -->
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
    </v-container>
  </v-app-bar>

  <!-- Mobile Drawer Navigation -->
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item v-for="(item, i) in menuItems" :key="i" :to="item.to">
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { isAuthenticated, getUser, logout } from "@/middleware/auth";

export default {
  data() {
    return {
      userName: "",
      userEmail: "",
      userPhoto: "",
      drawer: false,
      menuItems: [
        { title: "Home", to: "/" },
        { title: "Company", to: "/company" },
        { title: "Case", to: "/case" },
      ],
      userMenuItems: [
        { title: "Profile", to: "/profile", icon: "mdi-account-circle-outline" },
        { title: "Settings", to: "/settings", icon: "mdi-cog-outline" },
      ],
    };
  },
  computed: {
    isLoggedIn() {
      return isAuthenticated();
    },
  },
  async created() {
    if (this.isLoggedIn) {
      const user = await getUser();
      if (user) {
        this.userName = user.name || "User";
        this.userEmail = user.email || "user@example.com";
        this.userPhoto = user.photo || "https://i.pravatar.cc/150?img=3";
      }
    }
  },
  methods: {
  async handleLogout() {
    logout();
    this.userName = "";
    this.userEmail = "";
    this.userPhoto = "";
    this.$router.push("/login");
    window.location.reload(); // Pastikan navbar terupdate
  },
}
};
</script>

<style scoped>
  /* Tambahkan garis bawah untuk navigasi aktif */
.nav-item {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  padding: 10px 16px;
  position: relative;
}

.nav-item:hover {
  color: #00C853; /* Sesuaikan warna hijau karakter Sigma */
}

.active-nav {
  color: #00C853; /* Warna hijau aktif */
  font-weight: 600;
}

.active-nav::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -8px; /* Sesuaikan dengan border-bottom */
  width: 60%; /* Sesuaikan panjang garis */
  height: 2px;
  background-color: #00C853;
}

.nav-item:hover::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -8px; /* Sesuaikan dengan border-bottom */
  width: 60%; /* Sesuaikan panjang garis */
  height: 2px;
  background-color: #00C853;
  transition: all 0.2s ease-in-out;
}
</style>
