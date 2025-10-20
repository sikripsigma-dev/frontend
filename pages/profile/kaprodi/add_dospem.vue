<template>
  <v-container class="py-8">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-account-plus</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Tambahkan Dospem</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Buat akun untuk Dosen Pembimbing</p>
          </div>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-col>
    </v-row>

    <!-- Form -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="2" rounded="lg" class="pa-6">
          <v-form @submit.prevent="createAccount" ref="accountForm">
            <v-row>
              <!-- Role (fixed as Dosen Pembimbing) -->
              <v-col cols="12">
                <v-select
                  v-model="form.role"
                  :items="roles"
                  label="Jenis Akun*"
                  outlined
                  prepend-icon="mdi-account-tie"
                  :rules="[required]"
                  item-title="text"
                  item-value="value"
                  readonly
                  disabled
                />
              </v-col>

              <!-- Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Nama Lengkap*"
                  outlined
                  prepend-inner-icon="mdi-account"
                  :rules="[required]"
                />
              </v-col>

              <!-- Email -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email*"
                  outlined
                  prepend-inner-icon="mdi-email"
                  :rules="[required, emailRule]"
                  type="email"
                />
              </v-col>

              <!-- Phone -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phone"
                  label="Nomor Telepon*"
                  outlined
                  prepend-inner-icon="mdi-phone"
                  :rules="[required, phoneRule]"
                  type="tel"
                />
              </v-col>

              <!-- Institution -->
              <v-col cols="12">
                <v-select
                  v-model="form.institution_id"
                  :items="universityOptions"
                  label="Universitas/Institusi*"
                  item-title="title"
                  item-value="value"
                  outlined
                  prepend-inner-icon="mdi-school"
                  :rules="[required]"
                />
              </v-col>

              <!-- NIDN -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.nidn"
                  label="NIDN*"
                  outlined
                  prepend-inner-icon="mdi-identifier"
                  :rules="[required]"
                />
              </v-col>

              <!-- Info -->
              <v-col cols="12">
                <v-alert type="info" outlined>
                  Sistem akan menggenerate password sementara dan mengirimkannya via email
                </v-alert>
              </v-col>

              <!-- Actions -->
              <v-col cols="12" class="d-flex justify-end mt-4">
                <v-btn color="grey lighten-1" text class="mr-4" @click="resetForm">Reset</v-btn>
                <v-btn type="submit" color="primary" :loading="loading" :disabled="loading">
                  <v-icon left>mdi-content-save</v-icon> Buat Akun
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- History Table -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-title>
            <v-icon left>mdi-history</v-icon> Dospem Terakhir Ditambahkan
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recentHeaders"
              :items="recentAccounts"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.role="{ item }">
                <v-chip small color="primary">
                  Dosen
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-icon :color="item.status === 'active' ? 'success' : 'warning'">
                  {{ item.status === 'active' ? 'mdi-check-circle' : 'mdi-clock' }}
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'profile',
})
</script>

<script>
import { useUniversityService } from '~/composables/useUniversity'
import { useCreateUserService } from '~/composables/useCreateUser'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  data() {
    return {
      loading: false,
      universityOptions: [],
      form: {
        role: 'dosen',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: ''
      },
      roles: [
        { text: 'Dosen Pembimbing', value: 'dosen' }
      ],
      required: v => !!v || 'Wajib diisi',
      emailRule: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
      phoneRule: v => /^[0-9]{10,13}$/.test(v) || 'Nomor telepon tidak valid',
      recentHeaders: [
        { title: 'Nama', value: 'name' },
        { title: 'Email', value: 'email' },
        // { title: 'Jenis Akun', value: 'role' },
        { title: 'Dibuat Pada', value: 'createdAt' },
        { title: 'Status', value: 'status', align: 'center' }
      ],
      recentAccounts: []
    }
  },
  methods: {
    async fetchUniversities() {
      try {
        const { getUniversity } = useUniversityService()
        const { data, error } = await getUniversity()
        if (error.value) throw error.value

        this.universityOptions = data.value.map(u => ({
          title: u.name,
          value: u.id
        }))
      } catch (err) {
        console.error('Gagal fetch universitas:', err)
        this.$store.dispatch('showSnackbar', {
          text: 'Gagal memuat daftar universitas',
          color: 'error'
        })
      }
    },
    async createAccount() {
      if (this.$refs.accountForm.validate()) {
        this.loading = true
        const { addUser } = useCreateUserService()

        const payload = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          role_id: 4, // Fixed role ID for Dospem
          password: 'password123',
          nidn: this.form.nidn,
          university_id: this.form.institution_id
        }

        try {
          const { data, error } = await addUser(payload)
          if (error.value) throw error.value

          await this.loadUserCreations()
          this.resetForm()
          toast.success(`Akun Dospem berhasil dibuat!`)
        } catch (err) {
          toast.error(`Akun Dospem gagal dibuat.`)
          console.error(err)
        } finally {
          this.loading = false
        }
      }
    },
    async loadUserCreations() {
      try {
        const { getUserCreations } = useCreateUserService()
        const { data, error } = await getUserCreations()
        if (error.value) throw error.value

        // Filter only Dospem accounts (role_id = 4)
        this.recentAccounts = data.value
          .filter(item => item.RoleID === 4)
          .map(item => ({
            name: item.Name,
            email: item.Email,
            role: 'dosen',
            createdAt: item.CreatedAt,
            status: 'active'
          }))
      } catch (err) {
        console.error('Gagal memuat log pembuatan user:', err)
        this.$store.dispatch('showSnackbar', {
          text: 'Gagal memuat log akun',
          color: 'error'
        })
      }
    },
    resetForm() {
      this.form = {
        role: 'dosen',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: ''
      }
      this.$refs.accountForm.resetValidation()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  },
  mounted() {
    this.fetchUniversities()
    this.loadUserCreations()
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}
.v-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>