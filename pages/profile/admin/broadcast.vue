<template>
    <v-container class="py-6">
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-3">mdi-bullhorn</v-icon>
            <div>
              <h1 class="text-h4 font-weight-bold text-grey-darken-4">Broadcast Notification</h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                Kirim pemberitahuan ke pengguna sistem
              </p>
            </div>
          </div>
          <v-divider class="my-4"></v-divider>
        </v-col>
      </v-row>
  
      <!-- Notification Form -->
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card elevation="2" rounded="lg" class="pa-6">
            <v-form @submit.prevent="sendNotification" ref="notificationForm">
              <v-row>
                <!-- Recipient Selection -->
                <v-col cols="12">
                  <v-select
                    v-model="form.recipientType"
                    :items="recipientTypes"
                    label="Penerima*"
                    outlined
                    prepend-icon="mdi-account-multiple"
                    :rules="[required]"
                  ></v-select>
                </v-col>
  
                <!-- Specific Recipients (conditional) -->
                <v-col cols="12" v-if="form.recipientType === 'specific'">
                  <v-combobox
                    v-model="form.recipients"
                    :items="userList"
                    label="Pilih Penerima"
                    multiple
                    outlined
                    chips
                    item-text="name"
                    item-value="id"
                    :rules="form.recipientType === 'specific' ? [required] : []"
                  >
                    <template v-slot:selection="{ attrs, item, select, selected }">
                      <v-chip
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        @click="select"
                        @click:close="removeRecipient(item)"
                      >
                        <v-avatar left>
                          <v-img :src="item.avatar"></v-img>
                        </v-avatar>
                        {{ item.name }} ({{ item.role === 'dosen' ? 'Dosen' : 'Perusahaan' }})
                      </v-chip>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-avatar>
                        <v-img :src="item.avatar"></v-img>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ item.email }} • {{ item.role === 'dosen' ? 'Dosen' : 'Perusahaan' }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-combobox>
                </v-col>
  
                <!-- Notification Title -->
                <v-col cols="12">
                  <v-text-field
                    v-model="form.title"
                    label="Judul Notifikasi*"
                    outlined
                    prepend-inner-icon="mdi-format-title"
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
  
                <!-- Notification Message -->
                <v-col cols="12">
                  <v-textarea
                    v-model="form.message"
                    label="Pesan*"
                    outlined
                    rows="5"
                    prepend-inner-icon="mdi-message-text"
                    :rules="[required]"
                    counter
                    maxlength="500"
                  ></v-textarea>
                </v-col>
  
                <!-- Priority Level -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.priority"
                    :items="priorityLevels"
                    label="Prioritas"
                    outlined
                    prepend-icon="mdi-alert-circle"
                  ></v-select>
                </v-col>
  
                <!-- Notification Type -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.type"
                    :items="notificationTypes"
                    label="Jenis Notifikasi"
                    outlined
                    prepend-icon="mdi-bell"
                  ></v-select>
                </v-col>
  
                <!-- Schedule Options -->
                <v-col cols="12">
                  <v-switch
                    v-model="form.scheduleEnabled"
                    label="Jadwalkan Pengiriman"
                    color="primary"
                  ></v-switch>
                </v-col>
  
                <!-- Schedule Date (conditional) -->
                <v-col cols="12" md="6" v-if="form.scheduleEnabled">
                  <v-menu
                    v-model="datePicker"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="form.scheduleDate"
                        label="Tanggal Kirim"
                        prepend-icon="mdi-calendar"
                        readonly
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="form.scheduleDate"
                      @input="datePicker = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
  
                <!-- Schedule Time (conditional) -->
                <v-col cols="12" md="6" v-if="form.scheduleEnabled">
                  <v-menu
                    v-model="timePicker"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="form.scheduleTime"
                        label="Waktu Kirim"
                        prepend-icon="mdi-clock"
                        readonly
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="form.scheduleTime"
                      format="24hr"
                      @click:minute="timePicker = false"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
  
                <!-- Attachment -->
                <v-col cols="12">
                  <v-file-input
                    v-model="form.attachment"
                    label="Lampiran"
                    prepend-icon="mdi-paperclip"
                    outlined
                    show-size
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                  ></v-file-input>
                </v-col>
  
                <!-- Action Buttons -->
                <v-col cols="12" class="d-flex justify-end mt-4">
                  <v-btn
                    color="grey lighten-1"
                    text
                    class="mr-4"
                    @click="resetForm"
                  >
                    Reset
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="sending"
                    :disabled="sending"
                  >
                    <v-icon left>mdi-send</v-icon>
                    {{ form.scheduleEnabled ? 'Jadwalkan' : 'Kirim Sekarang' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Recent Notifications -->
      <v-row class="mt-8">
        <v-col cols="12">
          <v-card elevation="2" rounded="lg">
            <v-card-title>
              <v-icon left>mdi-history</v-icon>
              Notifikasi Terakhir Dikirim
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="historyHeaders"
                :items="notificationHistory"
                :items-per-page="5"
                class="elevation-1"
              >
                <template v-slot:item.recipients="{ item }">
                  {{ item.recipientType === 'all' ? 'Semua Pengguna' : `${item.recipients.length} Penerima` }}
                </template>
                <template v-slot:item.priority="{ item }">
                  <v-chip small :color="getPriorityColor(item.priority)" text-color="white">
                    {{ item.priority }}
                  </v-chip>
                </template>
                <template v-slot:item.sentAt="{ item }">
                  {{ formatDateTime(item.sentAt) }}
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon small @click="viewDetails(item)">
                    <v-icon small>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Notification Details Dialog -->
      <v-dialog v-model="detailsDialog" max-width="600">
        <v-card v-if="selectedNotification">
          <v-card-title class="d-flex justify-space-between">
            <span>Detail Notifikasi</span>
            <v-btn icon @click="detailsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-6">
            <div class="mb-4">
              <h3 class="text-h6 mb-2">{{ selectedNotification.title }}</h3>
              <p class="text-body-1">{{ selectedNotification.message }}</p>
            </div>
            <v-divider class="my-4"></v-divider>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-grey">Dikirim Kepada:</div>
                <div>{{ selectedNotification.recipientType === 'all' ? 'Semua Pengguna' : `${selectedNotification.recipients.length} Penerima` }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Prioritas:</div>
                <v-chip small :color="getPriorityColor(selectedNotification.priority)" text-color="white">
                  {{ selectedNotification.priority }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Waktu Kirim:</div>
                <div>{{ formatDateTime(selectedNotification.sentAt) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Status:</div>
                <div class="d-flex align-center">
                  <v-icon small :color="selectedNotification.status === 'delivered' ? 'success' : 'warning'" class="mr-1">
                    {{ selectedNotification.status === 'delivered' ? 'mdi-check-circle' : 'mdi-clock' }}
                  </v-icon>
                  {{ selectedNotification.status === 'delivered' ? 'Terkirim' : 'Dalam Antrian' }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
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
        sending: false,
        datePicker: false,
        timePicker: false,
        detailsDialog: false,
        selectedNotification: null,
        form: {
          recipientType: 'all',
          recipients: [],
          title: '',
          message: '',
          priority: 'normal',
          type: 'general',
          scheduleEnabled: false,
          scheduleDate: null,
          scheduleTime: null,
          attachment: null
        },
        recipientTypes: [
          { text: 'Semua Pengguna', value: 'all' },
          { text: 'Dosen Pembimbing', value: 'dosen' },
          { text: 'Perusahaan', value: 'perusahaan' },
          { text: 'Penerima Tertentu', value: 'specific' }
        ],
        priorityLevels: [
          { text: 'Rendah', value: 'low' },
          { text: 'Normal', value: 'normal' },
          { text: 'Tinggi', value: 'high' },
          { text: 'Darurat', value: 'urgent' }
        ],
        notificationTypes: [
          { text: 'Umum', value: 'general' },
          { text: 'Penting', value: 'important' },
          { text: 'Pengumuman', value: 'announcement' },
          { text: 'Pengingat', value: 'reminder' }
        ],
        userList: [
          {
            id: 1,
            name: 'Prof. Dr. Ahmad Fauzi',
            email: 'ahmad.fauzi@univ.ac.id',
            role: 'dosen',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          {
            id: 2,
            name: 'Dr. Siti Aminah',
            email: 'siti.aminah@univ.ac.id',
            role: 'dosen',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
          },
          {
            id: 3,
            name: 'PT. Teknologi Maju',
            email: 'hrd@tekmaju.co.id',
            role: 'perusahaan',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
          }
        ],
        historyHeaders: [
          { text: 'Judul', value: 'title' },
          { text: 'Penerima', value: 'recipients' },
          { text: 'Prioritas', value: 'priority', align: 'center' },
          { text: 'Waktu Kirim', value: 'sentAt' },
          { text: 'Aksi', value: 'actions', align: 'center', sortable: false }
        ],
        notificationHistory: [
          {
            id: 1,
            title: 'Pemeliharaan Sistem',
            message: 'Akan dilakukan pemeliharaan sistem pada hari Sabtu, 10 Juni 2023 pukul 00:00-04:00 WIB',
            recipientType: 'all',
            recipients: [],
            priority: 'high',
            type: 'announcement',
            sentAt: '2023-06-08T09:30:00',
            status: 'delivered'
          },
          {
            id: 2,
            title: 'Pengumpulan Laporan Mingguan',
            message: 'Harap mengumpulkan laporan mingguan paling lambat hari Jumat pukul 16:00 WIB',
            recipientType: 'dosen',
            recipients: [],
            priority: 'normal',
            type: 'reminder',
            sentAt: '2023-06-05T14:15:00',
            status: 'delivered'
          },
          {
            id: 3,
            title: 'Undangan Workshop',
            message: 'Diinformasikan akan diadakan workshop pengembangan sistem pada tanggal 15 Juni 2023',
            recipientType: 'specific',
            recipients: [
              { id: 1, name: 'Prof. Dr. Ahmad Fauzi' },
              { id: 3, name: 'PT. Teknologi Maju' }
            ],
            priority: 'normal',
            type: 'general',
            sentAt: '2023-06-03T11:45:00',
            status: 'delivered'
          }
        ],
        required: value => !!value || 'Wajib diisi'
      }
    },
    methods: {
      sendNotification() {
        if (this.$refs.notificationForm.validate()) {
          this.sending = true;
          
          // Simulate API call
          setTimeout(() => {
            // Add to notification history
            const newNotification = {
              id: Math.max(...this.notificationHistory.map(n => n.id)) + 1,
              title: this.form.title,
              message: this.form.message,
              recipientType: this.form.recipientType,
              recipients: this.form.recipients.map(r => ({ id: r.id, name: r.name })),
              priority: this.form.priority,
              type: this.form.type,
              sentAt: new Date().toISOString(),
              status: 'delivered'
            };
            
            this.notificationHistory.unshift(newNotification);
            this.resetForm();
            this.sending = false;
            this.$store.dispatch('showSnackbar', {
              text: 'Notifikasi berhasil dikirim!',
              color: 'success'
            });
          }, 1500);
        }
      },
      resetForm() {
        this.form = {
          recipientType: 'all',
          recipients: [],
          title: '',
          message: '',
          priority: 'normal',
          type: 'general',
          scheduleEnabled: false,
          scheduleDate: null,
          scheduleTime: null,
          attachment: null
        };
        this.$refs.notificationForm.resetValidation();
      },
      removeRecipient(item) {
        this.form.recipients = this.form.recipients.filter(r => r.id !== item.id);
      },
      viewDetails(item) {
        this.selectedNotification = item;
        this.detailsDialog = true;
      },
      formatDateTime(dateTime) {
        const options = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return new Date(dateTime).toLocaleDateString('id-ID', options);
      },
      getPriorityColor(priority) {
        switch(priority) {
          case 'low': return 'grey';
          case 'normal': return 'primary';
          case 'high': return 'orange';
          case 'urgent': return 'red';
          default: return 'grey';
        }
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
  
  /* Custom styling for the recipient chips */
  .v-chip {
    margin: 4px;
  }
  </style>