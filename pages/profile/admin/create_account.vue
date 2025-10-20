<template>
  <v-container class="py-8">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-account-plus</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Buat Akun Pengguna</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Buat akun untuk Kaprodi atau Perusahaan</p>
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

              <!-- Institution selector -->
              <v-col cols="12" v-if="form.role === 'kaprodi'">
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

              <!-- Kaprodi Only -->
              <template v-if="form.role === 'kaprodi'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.nidn"
                    label="NIDN*"
                    outlined
                    prepend-inner-icon="mdi-identifier"
                    :rules="[required]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.study_program_id"
                    :items="studyProgramOptions"
                    label="Program Studi*"
                    item-title="title"
                    item-value="value"
                    outlined
                    prepend-inner-icon="mdi-book-education"
                    :rules="[required]"
                    :disabled="prodiLoading || form.role !== 'kaprodi'"
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
              <template #item.role="{ item }">
                <v-chip small :color="item.role === 'kaprodi' ? 'primary' : 'secondary'">
                  {{ item.role === 'kaprodi' ? 'Kaprodi' : 'Perusahaan' }}
                </v-chip>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #item.status="{ item }">
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
definePageMeta({ layout: 'profile' })
</script>

<script>
import { useUniversityService } from '~/composables/useUniversity'
import { useDataCompany } from '~/composables/useDataCompany'
import { useCreateUserService } from '~/composables/useCreateUser'
import { useDataProdi } from '~/composables/useDataProdi'   // ⬅️ ganti ini
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  data() {
    return {
      loading: false,
      prodiLoading: false,
      universityOptions: [],
      companyOptions: [],
      studyProgramOptions: [],
      form: {
        role: '',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: '',
        study_program_id: '',            // ⬅️ pastikan ada
        division: ''
      },
      roles: [
        { text: 'Pilih Jenis Akun', value: '' },
        { text: 'Kaprodi', value: 'kaprodi' },
        { text: 'Perusahaan', value: 'perusahaan' }
      ],
      required: v => !!v || 'Wajib diisi',
      emailRule: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
      phoneRule: v => /^[0-9]{10,13}$/.test(v) || 'Nomor telepon tidak valid',
      recentHeaders: [
        { title: 'Nama', value: 'name' },
        { title: 'Email', value: 'email' },
        { title: 'Jenis Akun', value: 'role' },
        { title: 'Dibuat Pada', value: 'createdAt' },
        { title: 'Status', value: 'status', align: 'center' }
      ],
      recentAccounts: []
    }
  },

  watch: {
    // kalau universitas berganti (mode kaprodi) cukup reset pilihan prodi
    'form.institution_id'() {
      if (this.form.role === 'kaprodi') this.form.study_program_id = ''
    },
    // ketika role berganti, bersihkan field khusus
    'form.role'(r) {
      if (r !== 'kaprodi') { this.form.nidn = ''; this.form.study_program_id = '' }
      if (r !== 'perusahaan') this.form.division = ''
      this.form.institution_id = ''
    }
  },

  methods: {
    async fetchUniversities() {
      const { getUniversity } = useUniversityService()
      const { data, error } = await getUniversity()
      if (error.value) throw error.value

      // data.value bisa berupa array langsung ATAU { success, data: [...] }
      const list = Array.isArray(data.value) ? data.value : (data.value?.data || [])
      this.universityOptions = list.map(u => ({ title: u.name, value: u.id }))
    },

    async fetchCompanies() {
      const { getCompanies } = useDataCompany()
      const { data, error } = await getCompanies()
      if (error.value) throw error.value
      this.companyOptions = data.value.companies.map(c => ({ title: c.Name, value: c.Id }))
    },

    // ⬇️ NEW: ambil program studi dari useDataProdi.getProdis()
    async loadProdis() {
      this.prodiLoading = true
      try {
        const { prodis, getProdis } = useDataProdi()
        await getProdis()
        this.studyProgramOptions = (prodis.value || []).map(p => ({
          title: p.name,
          value: p.id
        }))
      } finally {
        this.prodiLoading = false
      }
    },
    async createAccount() {
      const ok = await this.$refs.accountForm?.validate?.()
      const valid = typeof ok === 'object' ? ok.valid : ok
      if (!valid) return

      this.loading = true
      const { addUser } = useCreateUserService()

      const role_id = this.form.role === 'kaprodi' ? 5 : 2  // kaprodi=5, perusahaan=2

      const payload = {
        name: this.form.name,
        email: this.form.email,
        phone: this.form.phone,
        role_id,
        password: 'password123',
        // kaprodi
        nidn: this.form.role === 'kaprodi' ? this.form.nidn : null,
        university_id: this.form.role === 'kaprodi' ? this.form.institution_id : null,
        study_program_id: this.form.role === 'kaprodi' ? this.form.study_program_id : null,
        // perusahaan
        company_id: this.form.role === 'perusahaan' ? this.form.institution_id : null,
        division: this.form.role === 'perusahaan' ? this.form.division : null
      }

      try {
        const { data, error } = await addUser(payload)
        if (error.value) throw error.value
        await this.loadUserCreations()
        this.resetForm()
        toast.success('Akun user berhasil dibuat!')
      } catch (e) {
        toast.error('Akun user gagal dibuat.')
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async loadUserCreations() {
      const { getUserCreations } = useCreateUserService()
      const { data, error } = await getUserCreations()
      if (error.value) throw error.value
      this.recentAccounts = data.value.map(item => ({
        name: item.Name,
        email: item.Email,
        role: item.RoleID === 5 ? 'kaprodi' : 'perusahaan',
        createdAt: item.CreatedAt,
        status: 'active'
      }))
    },

    resetForm() {
      this.form = {
        role: '',
        name: '',
        email: '',
        phone: '',
        institution_id: '',
        nidn: '',
        study_program_id: '',
        division: ''
      }
      this.$refs.accountForm?.resetValidation?.()
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  },

  async mounted() {
    try {
      await Promise.all([
        this.fetchUniversities(),
        this.fetchCompanies(),
        this.loadProdis()          // ⬅️ load semua prodi sekali
      ])
      await this.loadUserCreations()
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style scoped>
.v-card { transition: all 0.3s ease; }
.v-card:hover { box-shadow: 0 6px 12px rgba(0,0,0,.1) !important; }
</style>
