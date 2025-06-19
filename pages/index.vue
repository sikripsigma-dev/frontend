<template>
  <v-container fluid class="hero-section d-flex align-center justify-center">
    <!-- Overlay di belakang teks -->
    <div class="overlay d-md-none"></div>

    <div class="text-content">
      <h1 class="text-h3 font-weight-bold mb-3">
        Welcome to Skripsigma
      </h1>
      <p class="text-subtitle-1">
        Connecting students with companies for research opportunities.
      </p>
      <v-btn color="green-darken-2" to="/about" class="mt-4 px-6 py-3 text-white text-body-1 font-weight-bold">
        Learn More
      </v-btn>
    </div>
  </v-container>

  <!-- <v-container fluid class="d-flex justify-center">
    <SearchBar />
  </v-container>
  <v-container fluid class="d-flex justify-center">
    <ResearchCaseList />
  </v-container> -->
  <v-container fluid class="d-flex justify-center">
    <LatestResearchCase />
  </v-container>
</template>

<script>
  import SearchBar from '@/components/SearchBar.vue';
  import ResearchCaseList from '~/components/ResearchCaseList.vue';
  import LatestResearchCase from '~/components/LatestResearchCase.vue';
</script>

<style scoped>
.hero-section {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10%;
  background: url('/images/hero/edited_1742352336069.png') no-repeat right center;
  background-size: contain;
  background-color: #f5f5f5;
  position: relative;
}

/* Pastikan teks berada di atas overlay */
.text-content {
  max-width: 50%;
  margin-right: auto;
  position: relative;
  z-index: 2; /* Teks di atas overlay */
}

/* Overlay semi-transparan untuk tampilan mobile */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

/* Responsiveness */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    padding: 20px;
    background-size: cover;
    align-items: center;
    justify-content: center;
    text-align: center; /* Membuat teks di tengah */
  }

  .text-content {
    max-width: 90%;
    text-align: center;
    margin-right: 0;
  }

  .overlay {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
