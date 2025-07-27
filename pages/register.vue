<template>
  <v-container fluid class="register-page d-flex align-center justify-center">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="6" md="6" lg="6">
        <v-card elevation="10" class="pa-6 rounded-xl">
          <v-card-title class="justify-center text-h5 font-weight-bold mb-1">
            Daftar ke <span class="text-green-darken-2 ml-1">Skripsigma</span>
          </v-card-title>
          <v-card-subtitle class="text-center mb-6 text-body-2 text-grey-darken-1">
            Buat akun untuk mulai menjelajahi studi kasus
          </v-card-subtitle>

          <v-form @submit.prevent="register" ref="form" lazy-validation>
            <v-row dense>
              <!-- Kolom kiri -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="name"
                  label="Nama Lengkap"
                  prepend-inner-icon="mdi-account"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="phone"
                  label="Nomor HP"
                  prepend-inner-icon="mdi-phone"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="jurusan"
                  label="Jurusan"
                  prepend-inner-icon="mdi-school"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
              </v-col>

              <!-- Kolom kanan -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="confirmPassword"
                  label="Konfirmasi Password"
                  type="password"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="supervisor_email"
                  label="Email Dosen Pembimbing"
                  prepend-inner-icon="mdi-account-tie"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
                <v-text-field
                  v-model="gpa"
                  label="IPK"
                  type="number"
                  step="0.01"
                  prepend-inner-icon="mdi-star"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
              </v-col>

              <!-- Baris bawah -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="nim"
                  label="NIM"
                  prepend-inner-icon="mdi-card-account-details"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="selectedUniversity"
                  :items="universities"
                  item-title="name"
                  item-value="id"
                  label="Universitas"
                  prepend-inner-icon="mdi-domain"
                  :rules="requiredRule"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  color="primary"
                  required
                />
              </v-col>

              <!-- Tombol -->
              <v-col cols="12">
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
              </v-col>
            </v-row>
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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const supervisor_email = ref('')
const jurusan = ref('')
const gpa = ref(null)
const nim = ref('')
const selectedUniversity = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const requiredRule = [(v) => !!v || 'Field ini wajib diisi']

const universities = [
  { id: 'a4444444-4444-4444-4444-444444444444', name: 'STMIK Bandung' },
  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Universitas Gadjah Mada' },
  { id: 'a3333333-3333-3333-3333-333333333333', name: 'Universitas Indonesia' },
  { id: 'a2222222-2222-2222-2222-222222222222', name: 'Institut Teknologi Bandung' },
  { id: 'a5555555-5555-5555-5555-555555555555', name: 'Universitas Diponegoro' },
]

const register = async () => {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password dan konfirmasi tidak cocok.'
    return
  }

  loading.value = true

  try {
    const response = await fetch('http://127.0.0.1:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
        supervisor_email: supervisor_email.value,
        university_id: selectedUniversity.value,
        jurusan: jurusan.value,
        gpa: parseFloat(gpa.value),
        nim: nim.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registrasi gagal')
    }

    toast.success('Daftar berhasil! Silakan verifikasi email Anda.')

    // Delay sebentar agar toast terlihat
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    errorMessage.value = error.message
    toast.error(error.message || 'Terjadi kesalahan.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  background: linear-gradient(to bottom right, #e3f2fd, #ffffff);
  min-height: 100vh;
}
</style>
