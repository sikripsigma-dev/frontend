<template>
    <v-container class="py-8">
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-3">mdi-account-group</v-icon>
            <div>
              <h1 class="text-h4 font-weight-bold text-grey-darken-4">User Management</h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                Manage all registered users and their permissions
              </p>
            </div>
          </div>
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
                label="Search users..."
                outlined
                dense
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="roleFilter"
                :items="roleOptions"
                label="Filter by role"
                outlined
                dense
                clearable
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <v-btn color="primary" @click="openAddUserDialog">
                <v-icon left>mdi-plus</v-icon>
                Add New User
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
  
      <!-- Users Table -->
      <v-card elevation="2" rounded="lg">
        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :search="searchQuery"
          :items-per-page="10"
          class="elevation-0"
        >
          <!-- Avatar Column -->
          <template v-slot:item.avatar="{ item }">
            <v-avatar size="36" :color="item.avatar ? '' : getRandomColor(item.name)">
              <v-img v-if="item.avatar" :src="item.avatar"></v-img>
              <span v-else class="white--text">{{ getInitials(item.name) }}</span>
            </v-avatar>
          </template>
  
          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip small :color="getStatusColor(item.status)" dark>
              {{ item.status }}
            </v-chip>
          </template>
  
          <!-- Role Column -->
          <template v-slot:item.role="{ item }">
            <v-chip small :color="getRoleColor(item.role)" text-color="white">
              {{ item.role }}
            </v-chip>
          </template>
  
          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon small v-on="on" @click="editUser(item)">
                  <v-icon small color="primary">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit User</span>
            </v-tooltip>
            
            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon small v-on="on" @click="confirmDelete(item)">
                  <v-icon small color="error">mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete User</span>
            </v-tooltip> -->
          </template>
        </v-data-table>
      </v-card>
  
      <!-- Add/Edit User Dialog -->
      <v-dialog v-model="userDialog" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>{{ editingUser ? 'Edit User' : 'Add New User' }}</span>
            <v-btn icon @click="userDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-form ref="userForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.name"
                    label="Full Name"
                    outlined
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.email"
                    label="Email"
                    outlined
                    :rules="[required, emailRule]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="userForm.role"
                    :items="roleOptions"
                    label="Role"
                    outlined
                    :rules="[required]"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="userForm.status"
                    :items="statusOptions"
                    label="Status"
                    outlined
                    :rules="[required]"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn text @click="userDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveUser">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete {{ selectedUser?.name }}?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteDialog = false">Cancel</v-btn>
            <!-- <v-btn color="error" @click="deleteUser">Delete</v-btn> -->
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>

definePageMeta({
  layout: 'profile',
});

  export default {
    data() {
      return {
        searchQuery: '',
        roleFilter: null,
        userDialog: false,
        deleteDialog: false,
        editingUser: null,
        selectedUser: null,
        userForm: {
          name: '',
          email: '',
          role: '',
          status: ''
        },
        required: value => !!value || 'Required',
        emailRule: v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        headers: [
          { text: '', value: 'avatar', width: '50px', sortable: false },
          { text: 'Name', value: 'name' },
          { text: 'Email', value: 'email' },
          { text: 'Role', value: 'role', align: 'center' },
          { text: 'Status', value: 'status', align: 'center' },
          { text: 'Last Active', value: 'lastActive' },
          { text: 'Actions', value: 'actions', align: 'center', sortable: false }
        ],
        users: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Mahasiswa',
            status: 'Active',
            lastActive: '2023-05-15',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'Dosen Pembimbing',
            status: 'Active',
            lastActive: '2023-05-14',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
          },
          {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.j@example.com',
            role: 'Perusahaan',
            status: 'Inactive',
            lastActive: '2023-04-28',
            avatar: ''
          },
          {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            role: 'Dosen Pembimbing',
            status: 'Active',
            lastActive: '2023-05-12',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
          },
          {
            id: 5,
            name: 'Michael Wilson',
            email: 'michael.w@example.com',
            role: 'Perusahaan',
            status: 'Pending',
            lastActive: '2023-05-10',
            avatar: ''
          },
          {
            id: 6,
            name: 'Sarah Brown',
            email: 'sarah.b@example.com',
            role: 'Mahasiswa',
            status: 'Active',
            lastActive: '2023-05-15',
            avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
          },
          {
            id: 7,
            name: 'David Taylor',
            email: 'david.t@example.com',
            role: 'Dosen Pembimbing',
            status: 'Inactive',
            lastActive: '2023-03-22',
            avatar: ''
          },
          {
            id: 8,
            name: 'Jennifer Martinez',
            email: 'jennifer.m@example.com',
            role: 'Perusahaan',
            status: 'Active',
            lastActive: '2023-05-14',
            avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
          }
        ],
        roleOptions: ['Mahasiswa', 'Dosen Pembimbing', 'Perusahaan'],
        statusOptions: ['Active', 'Inactive', 'Pending']
      }
    },
    computed: {
      filteredUsers() {
        let filtered = this.users;
        
        if (this.roleFilter) {
          filtered = filtered.filter(user => user.role === this.roleFilter);
        }
        
        return filtered;
      }
    },
    methods: {
      getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
      },
      getRandomColor(name) {
        const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];
        const index = name.length % colors.length;
        return colors[index];
      },
      getStatusColor(status) {
        switch(status) {
          case 'Active': return 'success';
          case 'Inactive': return 'grey';
          case 'Pending': return 'warning';
          default: return 'grey';
        }
      },
      getRoleColor(role) {
        switch(role) {
          case 'Mahasiswa': return 'primary';
          case 'Dosen Pembimbing': return 'secondary';
          case 'Perusahaan': return 'success';
          default: return 'grey';
        }
      },
      openAddUserDialog() {
        this.editingUser = null;
        this.userForm = {
          name: '',
          email: '',
          role: '',
          status: ''
        };
        this.userDialog = true;
      },
      editUser(user) {
        this.editingUser = user;
        this.userForm = {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        };
        this.userDialog = true;
      },
      saveUser() {
        if (this.$refs.userForm.validate()) {
          if (this.editingUser) {
            // Update existing user
            const index = this.users.findIndex(u => u.id === this.editingUser.id);
            if (index !== -1) {
              this.users[index] = {
                ...this.users[index],
                ...this.userForm
              };
            }
          } else {
            // Add new user
            const newUser = {
              id: Math.max(...this.users.map(u => u.id)) + 1,
              ...this.userForm,
              lastActive: new Date().toISOString().split('T')[0],
              avatar: ''
            };
            this.users.unshift(newUser);
          }
          this.userDialog = false;
        }
      },
      confirmDelete(user) {
        this.selectedUser = user;
        this.deleteDialog = true;
      },
      deleteUser() {
        this.users = this.users.filter(u => u.id !== this.selectedUser.id);
        this.deleteDialog = false;
      }
    }
  }
  </script>
  
  <style scoped>
  .v-avatar {
    transition: transform 0.2s;
  }
  
  .v-avatar:hover {
    transform: scale(1.1);
  }
  
  .v-data-table >>> .v-data-table-header {
    background-color: #f5f5f5;
  }
  
  .v-data-table >>> th {
    font-weight: 600 !important;
  }
  </style>