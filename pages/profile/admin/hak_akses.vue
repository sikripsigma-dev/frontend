<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-4">Manajemen Role & Hak Akses</h1>

    <!-- Select Role -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedRole"
          :items="roleOptions"
          label="Pilih Role"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Info alert -->
    <v-alert type="info" class="mb-4" v-if="selectedRole">
      Hak akses berikut akan berlaku untuk <strong>{{ selectedRole }}</strong>. Silakan centang atau hilangkan centang sesuai kebutuhan.
    </v-alert>

    <!-- Permissions Table -->
    <v-card v-if="selectedPermissions" elevation="2" rounded="lg">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="selectedPermissions"
          item-value="menu"
          class="elevation-1"
          density="comfortable"
        >
          <template v-slot:item.menu="{ item }">
            <span class="font-weight-medium">{{ item.menu }}</span>
          </template>

          <template v-for="perm in permissionKeys" :key="perm" v-slot:[`item.${perm}`]="{ item }">
            <v-checkbox v-model="item.permissions[perm]" density="compact" hide-details />
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="savePermissions">Simpan Perubahan</v-btn>
      </v-card-actions>
    </v-card>

    <v-alert v-else type="warning" variant="tonal">
      Silakan pilih role terlebih dahulu untuk mengatur hak akses.
    </v-alert>
  </v-container>
</template>

<script setup>
definePageMeta({ layout: 'profile' })

import { ref, computed, watch } from 'vue'

const roleOptions = ['Admin', 'Student', 'Dosen Pembimbing', 'Perusahaan']
const selectedRole = ref(null)

const headers = [
  { title: 'Menu', value: 'menu' },
  { title: 'View', value: 'view', align: 'center' },
  { title: 'Add', value: 'add', align: 'center' },
  { title: 'Edit', value: 'edit', align: 'center' },
  { title: 'Delete', value: 'delete', align: 'center' },
  { title: 'Approve', value: 'approve', align: 'center' },
  { title: 'Export', value: 'export', align: 'center' }
]

const permissionKeys = ['view', 'add', 'edit', 'delete', 'approve', 'export']

// Simulasi role permission map (per role)
const rolePermissionsMap = {
  Admin: [
    {
      menu: 'User Management',
      permissions: { view: true, add: true, edit: true, delete: true, approve: false, export: true }
    },
    {
      menu: 'Company Management',
      permissions: { view: true, add: true, edit: true, delete: true, approve: true, export: true }
    },
    {
      menu: 'Reports',
      permissions: { view: true, export: true, add: false, edit: false, delete: false, approve: false }
    }
  ],
  Student: [
    {
      menu: 'Research Case',
      permissions: { view: true, add: true, edit: false, delete: false, approve: false, export: false }
    },
    {
      menu: 'Application History',
      permissions: { view: true, add: false, edit: false, delete: false, approve: false, export: true }
    }
  ],
  'Dosen Pembimbing': [
    {
      menu: 'Student Supervision',
      permissions: { view: true, approve: true, add: false, edit: false, delete: false, export: false }
    }
  ],
  Perusahaan: [
    {
      menu: 'Post Research Case',
      permissions: { view: true, add: true, edit: true, delete: true, approve: false, export: false }
    },
    {
      menu: 'Applicant Review',
      permissions: { view: true, approve: true, add: false, edit: false, delete: false, export: false }
    }
  ]
}

const selectedPermissions = computed(() => {
  return selectedRole.value ? rolePermissionsMap[selectedRole.value] : null
})

const savePermissions = () => {
  if (!selectedRole.value) return
  console.log(`Saving permissions for ${selectedRole.value}`, selectedPermissions.value)
  alert(`Hak akses untuk ${selectedRole.value} telah disimpan!`)
}
</script>

<style scoped>
.v-data-table th {
  text-align: center;
}
</style>
