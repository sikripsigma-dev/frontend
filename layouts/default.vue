<template>
  <v-app>
    <NavBar v-if="!hideNavbar" />
    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>


<script>
export default {
  computed: {
    hideNavbar() {
      return ["/login", "/register"].includes(this.$route.path);
    }
  }
};
</script>
