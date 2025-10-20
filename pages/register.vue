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
                <v-text-field v-model="name" label="Nama Lengkap" prepend-inner-icon="mdi-account"
                  :rules="requiredRule" variant="outlined" density="comfortable" class="mb-4" color="primary" required />
                <v-text-field v-model="password" label="Password" type="password"
                  prepend-inner-icon="mdi-lock-outline" :rules="requiredRule" variant="outlined"
                  density="comfortable" class="mb-4" color="primary" required />
                <v-text-field v-model="phone" label="Nomor HP" prepend-inner-icon="mdi-phone"
                  :rules="requiredRule" variant="outlined" density="comfortable" class="mb-4"
                  color="primary" required />
                <!-- <v-text-field v-model="jurusan" label="Jurusan" prepend-inner-icon="mdi-school"
                  :rules="requiredRule" variant="outlined" density="comfortable" class="mb-4"
                  color="primary" required /> -->
              </v-col>

              <!-- Kolom kanan -->
              <v-col cols="12" sm="6">
                <v-text-field v-model="email" label="Email" type="email"
                  prepend-inner-icon="mdi-email-outline" :rules="requiredRule" variant="outlined"
                  density="comfortable" class="mb-4" color="primary" required />
                <v-text-field v-model="confirmPassword" label="Konfirmasi Password" type="password"
                  prepend-inner-icon="mdi-lock-check-outline" :rules="requiredRule" variant="outlined"
                  density="comfortable" class="mb-4" color="primary" required />
                <!-- ⬇️ ganti email dospem -> select prodi -->
                <v-select v-model="selectedStudyProgram" :items="prodiOptions" item-title="title" item-value="value"
                  label="Program Studi" prepend-inner-icon="mdi-book-education"
                  :rules="requiredRule" variant="outlined" density="comfortable"
                  class="mb-4" color="primary" :loading="prodiLoading" required />
                <v-text-field v-model="gpa" label="IPK" type="number" step="0.01"
                  prepend-inner-icon="mdi-star" :rules="requiredRule" variant="outlined"
                  density="comfortable" class="mb-4" color="primary" required />
              </v-col>

              <!-- Baris bawah -->
              <v-col cols="12" sm="6">
                <v-text-field v-model="nim" label="NIM" prepend-inner-icon="mdi-card-account-details"
                  :rules="requiredRule" variant="outlined" density="comfortable"
                  class="mb-4" color="primary" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="selectedUniversity" :items="universityOptions"
                  item-title="title" item-value="value" label="Universitas"
                  prepend-inner-icon="mdi-domain" :rules="requiredRule" variant="outlined"
                  density="comfortable" class="mb-4" color="primary"
                  :loading="univLoading" required />
              </v-col>

              <!-- Tombol -->
              <v-col cols="12">
                <v-btn :loading="loading" :disabled="loading" type="submit" color="green"
                  class="rounded-lg" block>
                  <template v-if="!loading">Daftar</template>
                  <template v-else>Registering...</template>
                </v-btn>

                <v-alert v-if="errorMessage" type="error" class="mt-4"
                  border="start" variant="tonal" prominent density="compact">
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useRuntimeConfig } from '#app'
import { useUniversityService } from '@/composables/useUniversity'
import { useDataProdi } from '@/composables/useDataProdi'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const toast = useToast()
const config = useRuntimeConfig()
const API = config.public.apiBase

// form state
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
// const jurusan = ref('')
const gpa = ref(null)
const nim = ref('')

// NEW: select data
const selectedUniversity = ref(null)
const selectedStudyProgram = ref(null)
const universityOptions = ref([])
const prodiOptions = ref([])
const univLoading = ref(false)
const prodiLoading = ref(false)

const loading = ref(false)
const errorMessage = ref('')

const requiredRule = [(v) => !!v || 'Field ini wajib diisi']

// load universities (map ke {title,value})
const loadUniversities = async () => {
  univLoading.value = true
  try {
    // langsung call API, karena responsenya { success, data: [...] }
    const res: any = await $fetch(`${API}/api/university`, { credentials: 'include' })
    const list = Array.isArray(res) ? res : (res?.data || [])
    universityOptions.value = list.map((u: any) => ({ title: u.name, value: u.id }))
  } finally {
    univLoading.value = false
  }
}

// load prodi (map ke {title,value})
const loadProdis = async () => {
  prodiLoading.value = true
  try {
    const { prodis, getProdis } = useDataProdi()
    await getProdis()
    prodiOptions.value = (prodis.value || []).map(p => ({ title: p.name, value: p.id }))
  } finally {
    prodiLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadUniversities(), loadProdis()])
})

const register = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password dan konfirmasi tidak cocok.'
    return
  }
  if (!selectedUniversity.value || !selectedStudyProgram.value) {
    errorMessage.value = 'Universitas dan Program Studi wajib dipilih.'
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
        university_id: selectedUniversity.value,
        study_program_id: selectedStudyProgram.value, // ⬅️ penting
        // jurusan: jurusan.value,
        gpa: parseFloat(gpa.value),
        nim: nim.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registrasi gagal')

    toast.success('Daftar berhasil! Silakan verifikasi email Anda.')
    setTimeout(() => router.push('/login'), 1000)
  } catch (e) {
    errorMessage.value = e.message
    toast.error(e.message || 'Terjadi kesalahan.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page { background: linear-gradient(to bottom right, #e3f2fd, #ffffff); min-height: 100vh; }
</style>
