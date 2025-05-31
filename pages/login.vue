<template>
  <v-container fluid class="login-page d-flex align-center justify-center">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card elevation="10" class="pa-6 rounded-xl">
          <v-card-title class="justify-center text-h5 font-weight-bold mb-1">
            Masuk ke <span class="text-green-darken-2 ml-1">Skripsigma</span>
          </v-card-title>
          <v-card-subtitle class="text-center mb-6 text-body-2 text-grey-darken-1">
            Platform skripsi berbasis studi kasus nyata
          </v-card-subtitle>

          <v-form ref="form" @submit.prevent="login" lazy-validation>
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              density="comfortable"
              variant="outlined"
              color="primary"
              class="mb-4"
              required
            />

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              prepend-inner-icon="mdi-lock-outline"
              density="comfortable"
              variant="outlined"
              color="primary"
              class="mb-4"
              required
            />

            <v-btn
              :loading="loading"
              :disabled="loading"
              type="submit"
              color="green"
              class="rounded-lg"
              block
            >
              <template v-if="!loading">Login</template>
              <template v-else>Logging in...</template>
            </v-btn>

            <v-alert
              v-if="errorMessage"
              type="error"
              class="mt-4"
              border="start"
              variant="tonal"
              prominent
              density="compact"
            >
              {{ errorMessage }}
            </v-alert>
          </v-form>

          <div class="my-6 text-center text-body-2 text-grey-darken-1">atau</div>

          <v-btn
            @click="loginWithGoogle"
            variant="outlined"
            color="red darken-1"
            prepend-icon="mdi-google"
            class="mb-4 rounded-lg"
            block
          >
            Login dengan Google
          </v-btn>

          <div class="text-center text-body-2">
            Belum punya akun?
            <router-link to="/register" class="text-primary font-weight-medium">Daftar sekarang</router-link>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: "auth",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login gagal");
        }

        localStorage.setItem("token", data.token);
        this.$router.push("/");
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    },

    loginWithGoogle() {
      // Arahkan ke endpoint Google OAuth dari backend
      window.location.href = "http://localhost:3001/api/auth/google";
    },
  },
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(to bottom right, #e3f2fd, #ffffff);
  min-height: 100vh;
}
</style>
