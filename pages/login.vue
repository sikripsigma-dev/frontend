<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-center text-h5 font-weight-bold mb-4">Login to Skripsigma</v-card-title>

      <v-form ref="form" @submit.prevent="login">
        <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" required></v-text-field>

        <v-btn type="submit" color="primary" block :loading="loading">Login</v-btn>

        <v-alert v-if="errorMessage" type="error" dense class="mt-4">
          {{ errorMessage }}
        </v-alert>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/register">Don't have an account? Register</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  layout: "auth", // Pakai layout tanpa navbar
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
          throw new Error(data.error || "Login failed");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
        }

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
