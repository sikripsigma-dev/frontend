<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card elevation="4" class="pa-8 text-center" max-width="500" rounded="lg">
      <v-card-title class="text-h4 font-weight-bold mb-4">
        Email Verification
      </v-card-title>
      
      <v-card-text>
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
          class="my-6"
        ></v-progress-circular>
        
        <v-alert
          v-else-if="success"
          type="success"
          variant="tonal"
          class="mb-4 text-left"
        >
          <template v-slot:prepend>
            <v-icon color="success" size="x-large" class="mr-3">mdi-check-circle</v-icon>
          </template>
          <div class="text-h6 font-weight-medium mb-2">Verification Successful!</div>
          <p>Your email has been successfully verified. You'll be redirected to the login page shortly.</p>
        </v-alert>
        
        <v-alert
          v-else
          type="error"
          variant="tonal"
          class="mb-4 text-left"
        >
          <template v-slot:prepend>
            <v-icon color="error" size="x-large" class="mr-3">mdi-alert-circle</v-icon>
          </template>
          <div class="text-h6 font-weight-medium mb-2">Verification Failed</div>
          <p>{{ errorMessage }}</p>
          <v-btn
            color="error"
            variant="text"
            class="mt-2"
            @click="retryVerification"
            :loading="retrying"
          >
            Try Again
          </v-btn>
        </v-alert>
      </v-card-text>
      
      <v-card-actions v-if="!loading" class="justify-center">
        <v-btn
          color="primary"
          variant="flat"
          :to="{ name: 'login' }"
        >
          Back to Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const { verifyUser } = useAuth();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');
const retrying = ref(false);

const verify = async (token: string) => {
  try {
    loading.value = true;
    errorMessage.value = '';
    
    const result = await verifyUser(token);

    if (result.success) {
      success.value = true;
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 3000);
    } else {
      errorMessage.value = result.message || 'An unknown error occurred during verification.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to connect to the server. Please check your internet connection.';
  } finally {
    loading.value = false;
  }
};

const retryVerification = async () => {
  const token = route.query.token as string;
  if (!token) return;
  
  retrying.value = true;
  await verify(token);
  retrying.value = false;
};

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    loading.value = false;
    errorMessage.value = 'Verification token is missing from the URL. Please check your email for the correct link.';
    return;
  }

  await verify(token);
});
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card-title {
  word-break: break-word;
}
</style>