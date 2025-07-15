<template>
  <v-container class="py-8">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-account-plus</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Buat Akun Pengguna</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Buat akun untuk Dosen Pembimbing atau Perusahaan</p>
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
              <!-- Role -->
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
              <v-col cols="12" v-if="form.role === 'dosen'">
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

              <v-col cols="12" v-if="form.role === 'perusahaan'">
                <v-select
                  v-model="form.institution_id"
                  :items="companyOptions"
                  label="Perusahaan*"
                  item-title="title"
                  item-value="value"
                  outlined
                  prepend-inner-icon="mdi-office-building"
                  :rules="[required]"
                />
              </v-col>

              <!-- Dosen Only -->
              <template v-if="form.role === 'dosen'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.nidn"
                    label="NIDN*"
                    outlined
                    prepend-inner-icon="mdi-identifier"
                    :rules="[required]"
                  />
                </v-col>
              </template>

              <!-- Perusahaan Only -->
              <template v-if="form.role === 'perusahaan'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.division"
                    label="Divisi*"
                    outlined
                    prepend-inner-icon="mdi-office-building-cog"
                    :rules="[required]"
                  />
                </v-col>
              </template>

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
            <v-icon left>mdi-history</v-icon> Akun Terakhir Dibuat
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recentHeaders"
              :items="recentAccounts"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.role="{ item }">
                <v-chip small :color="item.role === 'dosen' ? 'primary' : 'secondary'">
                  {{ item.role === 'dosen' ? 'Dosen' : 'Perusahaan' }}
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
import { useDataCompany } from '~/composables/useDataCompany'
import { useCreateUserService } from '~/composables/useCreateUser'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  data() {
    return {
      loading: false,
      universityOptions: [],
      companyOptions: [],
      form: {
        role: '',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: '',
        division: ''
      },
      roles: [
        { text: 'Pilih Jenis Akun', value: '' },
        { text: 'Dosen Pembimbing', value: 'dosen' },
        { text: 'Perusahaan', value: 'perusahaan' }
      ],
      required: v => !!v || 'Wajib diisi',
      emailRule: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
      phoneRule: v => /^[0-9]{10,13}$/.test(v) || 'Nomor telepon tidak valid',
      recentHeaders: [
        { title: 'Nama', value: 'name' },
        { title: 'Email', value: 'email' },
        { title: 'Jenis Akun', value: 'role' },
        // { title: 'Institusi/Perusahaan', value: 'institution' },
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
    async fetchCompanies() {
      try {
        const { getCompanies } = useDataCompany()
        const { data, error } = await getCompanies()
        if (error.value) throw error.value

        this.companyOptions = data.value.companies.map(c => ({
          title: c.Name,
          value: c.Id
        }))
      } catch (err) {
        console.error('Gagal fetch perusahaan:', err)
        this.$store.dispatch('showSnackbar', {
          text: 'Gagal memuat daftar perusahaan',
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
          role_id: this.form.role === 'dosen' ? 4 : 2,
          password: 'password123',
          nidn: this.form.role === 'dosen' ? this.form.nidn : null,
          university_id: this.form.role === 'dosen' ? this.form.institution_id : null,
          company_id: this.form.role === 'perusahaan' ? this.form.institution_id : null,
          division: this.form.role === 'perusahaan' ? this.form.division : null
        }

        try {
          const { data, error } = await addUser(payload)
          if (error.value) throw error.value

          await this.loadUserCreations()
          this.resetForm()
          toast.success(`Akun user berhasil dibuat!`)
        } catch (err) {
          toast.error(`Akun user gagal dibuat.`)
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

      this.recentAccounts = data.value.map(item => ({
        name: item.Name,
        email: item.Email,
        role: item.RoleID === 4 ? 'dosen' : 'perusahaan',
        // institution: item.InstitutionName || '-',
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
        role: '',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: '',
        division: ''
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
    this.fetchCompanies()
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
