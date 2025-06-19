<template>
    <v-container fluid class="register-page d-flex align-center justify-center">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="5" lg="4">
          <v-card elevation="10" class="pa-6 rounded-xl">
            <v-card-title class="justify-center text-h5 font-weight-bold mb-1">
              Daftar ke <span class="text-green-darken-2 ml-1">Skripsigma</span>
            </v-card-title>
            <v-card-subtitle class="text-center mb-6 text-body-2 text-grey-darken-1">
              Buat akun untuk mulai menjelajahi studi kasus
            </v-card-subtitle>
  
            <v-form ref="form" @submit.prevent="register" lazy-validation>
              <v-text-field
                v-model="name"
                label="Nama Lengkap"
                prepend-inner-icon="mdi-account"
                density="comfortable"
                variant="outlined"
                color="primary"
                class="mb-4"
                required
              />
  
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
  
              <v-text-field
                v-model="confirmPassword"
                label="Konfirmasi Password"
                type="password"
                prepend-inner-icon="mdi-lock-check-outline"
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
                <template v-if="!loading">Daftar</template>
                <template v-else>Registering...</template>
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
  
            <div class="text-center mt-6 text-body-2">
              Sudah punya akun?
              <router-link to="/login" class="text-primary font-weight-medium">Login di sini</router-link>
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
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        loading: false,
        errorMessage: "",
      };
    },
    methods: {
      async register() {
        this.errorMessage = "";
  
        if (this.password !== this.confirmPassword) {
          this.errorMessage = "Password dan konfirmasi tidak cocok.";
          return;
        }
  
        this.loading = true;
  
        try {
          const response = await fetch("http://localhost:3001/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: this.name,
              email: this.email,
              password: this.password,
            }),
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.error || "Registrasi gagal");
          }
  
          // Simpan token jika dikembalikan atau redirect ke login
          localStorage.setItem("token", data.token);
          this.$router.push("/");
        } catch (error) {
          this.errorMessage = error.message;
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .register-page {
    background: linear-gradient(to bottom right, #e3f2fd, #ffffff);
    min-height: 100vh;
  }
  </style>
  