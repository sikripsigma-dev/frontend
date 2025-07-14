<template>
  <v-container class="py-6">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-office-building-marker</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Manajemen Perusahaan</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Kelola semua perusahaan yang terdaftar dalam sistem
            </p>
          </div>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-col>
    </v-row>

    <!-- Action Bar -->
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Cari perusahaan..."
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="industryFilter"
              :items="industryOptions"
              label="Filter industri"
              outlined
              dense
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn color="primary" @click="openAddCompanyDialog">
              <v-icon left>mdi-plus</v-icon>
              Tambah Perusahaan
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Companies Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredCompanies"
        :search="searchQuery"
        :items-per-page="10"
        class="elevation-1"
      >
        <!-- Logo Column -->
        <template v-slot:item.logo="{ item }">
          <v-avatar size="40" color="grey lighten-3">
            <v-img v-if="item.logo" :src="item.logo"></v-img>
            <span v-else class="text-caption">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip small :color="getStatusColor(item.status)" dark>
            {{ item.status === 'active' ? 'Aktif' : 'Nonaktif' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="editCompany(item)">
                <v-icon small color="primary">mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="toggleStatus(item)">
                <v-icon small :color="item.status === 'active' ? 'warning' : 'success'">
                  {{ item.status === 'active' ? 'mdi-close' : 'mdi-check' }}
                </v-icon>
              </v-btn>
            </template>
            <span>{{ item.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}</span>
          </v-tooltip>
          
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <!-- <v-btn icon small v-on="on" @click="confirmDelete(item)">
                <v-icon small color="error">mdi-delete</v-icon>
              </v-btn> -->
            </template>
            <span>Hapus</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Company Dialog -->
    <v-dialog v-model="companyDialog" max-width="800" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editingCompany ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru' }}</span>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="companyForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="companyForm.name"
                  label="Nama Perusahaan*"
                  outlined
                  :rules="[required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="companyForm.email"
                  label="Email*"
                  outlined
                  :rules="[required, emailRule]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="companyForm.phone"
                  label="Telepon*"
                  outlined
                  :rules="[required, phoneRule]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="companyForm.industry"
                  :items="industryOptions"
                  label="Industri*"
                  outlined
                  :rules="[required]"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="companyForm.website"
                  label="Website"
                  outlined
                  prepend-inner-icon="mdi-web"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="companyForm.address"
                  label="Alamat*"
                  outlined
                  rows="3"
                  :rules="[required]"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="companyForm.city"
                  label="Kota*"
                  outlined
                  :rules="[required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="companyForm.postalCode"
                  label="Kode Pos"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="companyForm.logoFile"
                  label="Logo Perusahaan"
                  prepend-icon="mdi-image"
                  outlined
                  accept="image/*"
                  show-size
                ></v-file-input>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="companyForm.status"
                  label="Status Aktif"
                  color="success"
                  :true-value="'active'"
                  :false-value="'inactive'"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Batal</v-btn>
          <v-btn color="primary" @click="saveCompany" :loading="saving">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus {{ selectedCompany?.name }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" @click="deleteCompany">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'profile',
})
</script>


<script>
export default {
  data() {
    return {
      searchQuery: '',
      industryFilter: null,
      companyDialog: false,
      deleteDialog: false,
      editingCompany: null,
      selectedCompany: null,
      saving: false,
      companyForm: {
        name: '',
        email: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        logoFile: null,
        status: 'active'
      },
      required: value => !!value || 'Wajib diisi',
      emailRule: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
      phoneRule: v => /^[0-9]{10,13}$/.test(v) || 'Nomor telepon tidak valid',
      headers: [
        { title: '', value: 'logo', width: '60px', sortable: false },
        { title: 'Nama Perusahaan', value: 'name' },
        { title: 'Industri', value: 'industry' },
        { title: 'Email', value: 'email' },
        { title: 'Telepon', value: 'phone' },
        { title: 'Status', value: 'status', align: 'center' },
        { title: 'Aksi', value: 'actions', align: 'center', sortable: false }
      ],
      industryOptions: [
        'Teknologi Informasi',
        'Keuangan',
        'Manufaktur',
        'Kesehatan',
        'Pendidikan',
        'Retail',
        'Konstruksi',
        'Transportasi',
        'Energi',
        'Lainnya'
      ],
      companies: [
        {
          id: 1,
          name: 'PT. Teknologi Maju',
          email: 'info@tekmaju.co.id',
          phone: '02112345678',
          industry: 'Teknologi Informasi',
          website: 'https://tekmaju.co.id',
          address: 'Jl. Sudirman No. 123, Jakarta Selatan',
          city: 'Jakarta',
          postalCode: '12345',
          logo: 'https://via.placeholder.com/150',
          status: 'active'
        },
        {
          id: 2,
          name: 'PT. Bina Konstruksi',
          email: 'kontak@binakonstruksi.com',
          phone: '02123456789',
          industry: 'Konstruksi',
          website: 'https://binakonstruksi.com',
          address: 'Jl. Thamrin No. 45, Jakarta Pusat',
          city: 'Jakarta',
          postalCode: '10110',
          logo: '',
          status: 'active'
        },
        {
          id: 3,
          name: 'PT. Sehat Selalu',
          email: 'cs@sehatselalu.co.id',
          phone: '02134567890',
          industry: 'Kesehatan',
          website: 'https://sehatselalu.co.id',
          address: 'Jl. Gatot Subroto No. 67, Jakarta Barat',
          city: 'Jakarta',
          postalCode: '11450',
          logo: '',
          status: 'inactive'
        }
      ]
    }
  },
  computed: {
    filteredCompanies() {
      let filtered = this.companies;
      
      if (this.industryFilter) {
        filtered = filtered.filter(company => company.industry === this.industryFilter);
      }
      
      return filtered;
    }
  },
  methods: {
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    getStatusColor(status) {
      return status === 'active' ? 'success' : 'grey';
    },
    openAddCompanyDialog() {
      this.editingCompany = null;
      this.companyForm = {
        name: '',
        email: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        logoFile: null,
        status: 'active'
      };
      this.companyDialog = true;
    },
    editCompany(company) {
      this.editingCompany = company;
      this.companyForm = { ...company };
      this.companyDialog = true;
    },
    closeDialog() {
      this.companyDialog = false;
      this.$refs.companyForm?.resetValidation();
    },
    saveCompany() {
      if (this.$refs.companyForm.validate()) {
        this.saving = true;
        
        // Simulate API call
        setTimeout(() => {
          if (this.editingCompany) {
            // Update existing company
            const index = this.companies.findIndex(c => c.id === this.editingCompany.id);
            if (index !== -1) {
              this.companies[index] = {
                ...this.companies[index],
                ...this.companyForm
              };
            }
          } else {
            // Add new company
            const newCompany = {
              id: Math.max(...this.companies.map(c => c.id)) + 1,
              ...this.companyForm
            };
            this.companies.unshift(newCompany);
          }
          
          this.saving = false;
          this.companyDialog = false;
          this.$store.dispatch('showSnackbar', {
            text: `Perusahaan ${this.editingCompany ? 'diperbarui' : 'ditambahkan'}!`,
            color: 'success'
          });
        }, 1000);
      }
    },
    toggleStatus(company) {
      company.status = company.status === 'active' ? 'inactive' : 'active';
      this.$store.dispatch('showSnackbar', {
        text: `Status ${company.name} diperbarui`,
        color: 'success'
      });
    },
    confirmDelete(company) {
      this.selectedCompany = company;
      this.deleteDialog = true;
    },
    deleteCompany() {
      this.companies = this.companies.filter(c => c.id !== this.selectedCompany.id);
      this.deleteDialog = false;
      this.$store.dispatch('showSnackbar', {
        text: `${this.selectedCompany.name} dihapus`,
        color: 'success'
      });
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
}

.v-data-table >>> .v-data-table-header {
  background-color: #f5f5f5;
}

.v-data-table >>> th {
  font-weight: 600 !important;
}
</style>