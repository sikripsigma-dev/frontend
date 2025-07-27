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
        <template v-slot:item.logo="{ item }">
          <v-avatar size="40" color="grey lighten-3">
            <v-img v-if="item.logo" :src="item.logo"></v-img>
            <span v-else class="text-caption">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip small :color="getStatusColor(item.status)" dark>
            {{ item.status === 'active' ? 'Aktif' : 'Nonaktif' }}
          </v-chip>
        </template>

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

          <!-- <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="confirmDelete(item)">
                <v-icon small color="error">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Hapus</span>
          </v-tooltip> -->
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogs -->
    <v-dialog v-model="companyDialog" max-width="800" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editingCompany ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru' }}</span>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="companyFormRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="companyForm.name" label="Nama Perusahaan*" outlined :rules="[required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="companyForm.email" label="Email*" outlined :rules="[required, emailRule]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="companyForm.phone" label="Telepon*" outlined :rules="[required, phoneRule]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="companyForm.industry" :items="industryOptions" label="Industri*" outlined :rules="[required]" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="companyForm.website" label="Website" outlined prepend-inner-icon="mdi-web" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="companyForm.address" label="Alamat*" outlined rows="3" :rules="[required]" />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="companyForm.status" label="Status Aktif" color="success" :true-value="'active'" :false-value="'inactive'" />
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

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
        <v-card-text>Apakah Anda yakin ingin menghapus {{ selectedCompany?.name }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" @click="deleteCompanyAction">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDataCompany } from '@/composables/useDataCompany';

definePageMeta({
  layout: 'profile',
})

const {
  companies,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} = useDataCompany();

const searchQuery = ref('');
const industryFilter = ref(null);
const companyDialog = ref(false);
const deleteDialog = ref(false);
const editingCompany = ref(null);
const selectedCompany = ref(null);
const saving = ref(false);
const companyFormRef = ref(null);

const companyForm = ref({
  name: '',
  email: '',
  phone: '',
  industry: '',
  website: '',
  address: '',
  status: 'active'
});

const required = value => !!value || 'Wajib diisi';
const emailRule = v => /.+@.+\..+/.test(v) || 'Email tidak valid';
const phoneRule = v => /^[0-9]{10,13}$/.test(v) || 'Nomor telepon tidak valid';

const headers = [
  { title: '', value: 'logo', width: '60px', sortable: false },
  { title: 'Nama Perusahaan', value: 'name' },
  { title: 'Industri', value: 'industry' },
  { title: 'Email', value: 'email' },
  { title: 'Telepon', value: 'phone' },
  { title: 'Status', value: 'status', align: 'center' },
  { title: 'Aksi', value: 'actions', align: 'center', sortable: false }
];

const industryOptions = [
  'Teknologi Informasi', 'Keuangan', 'Manufaktur', 'Kesehatan',
  'Pendidikan', 'Retail', 'Konstruksi', 'Transportasi', 'Energi', 'Lainnya'
];

const getInitials = name => name.split(' ').map(n => n[0]).join('').toUpperCase();
const getStatusColor = status => status === 'active' ? 'success' : 'grey';

const filteredCompanies = computed(() => {
  return companies.value.filter(c =>
    (!industryFilter.value || c.industry === industryFilter.value) &&
    (!searchQuery.value || c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const openAddCompanyDialog = () => {
  editingCompany.value = null;
  companyForm.value = {
    name: '', email: '', phone: '', industry: '', website: '', address: '', status: 'active'
  };
  companyDialog.value = true;
};

const editCompany = company => {
  editingCompany.value = company;
  companyForm.value = { ...company };
  companyDialog.value = true;
};

const closeDialog = () => {
  companyDialog.value = false;
  companyFormRef.value?.resetValidation();
};

const saveCompany = async () => {
  if (companyFormRef.value.validate()) {
    saving.value = true;
    if (editingCompany.value) {
      await updateCompany(editingCompany.value.id, companyForm.value);
    } else {
      await createCompany(companyForm.value);
    }
    saving.value = false;
    companyDialog.value = false;
  }
};

const confirmDelete = company => {
  selectedCompany.value = company;
  deleteDialog.value = true;
};

const deleteCompanyAction = async () => {
  if (selectedCompany.value) {
    await deleteCompany(selectedCompany.value.id);
    deleteDialog.value = false;
  }
};

const toggleStatus = async (company) => {
  const newStatus = company.status === 'active' ? 'inactive' : 'active';
  await updateCompany(company.id, { ...company, status: newStatus });
};

onMounted(getCompanies);
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}
.v-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}
.v-data-table >>> .v-data-table-header {
  background-color: #f5f5f5;
}
.v-data-table >>> th {
  font-weight: 600 !important;
}
</style>
