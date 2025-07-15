<template>
    <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
      <v-row no-gutters class="fill-height">
        <!-- <v-col cols="12" md="10" lg="10" class="mx-auto pa-4"> -->
        <v-col cols="12" class="mx-auto px-4 py-6" style="width: 100%; max-width: 960px; box-sizing: border-box;">
        <!-- <v-col cols="12" md="10" lg="8" class="mx-auto px-4 py-6"> -->
          <v-card elevation="2" rounded="lg" class="pa-4">
            <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center mb-2">
              <span>Notifikasi</span>
              <v-chip
                v-if="unreadCount > 0"
                size="small"
                color="red-darken-2"
                text-color="white"
                label
                class="font-weight-bold"
              >
                {{ unreadCount }} belum dibaca
              </v-chip>
            </v-card-title>
  
            <v-divider class="mb-4" />
  
            <v-list>
              <v-list-item
                v-for="notif in notifications"
                :key="notif.id"
                :class="[
                  'rounded-lg',
                  'mb-2',
                  notif.read ? 'bg-grey-lighten-4' : 'bg-blue-lighten-5',
                ]"
                class="notification-item"
                @click="markAsReadLocal(notif)"
              >
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium text-body-1 mb-1">
                    {{ notif.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-grey-darken-1">
                    {{ notif.message }}
                  </v-list-item-subtitle>
                </v-list-item-content>
  
                <v-list-item-action>
                  <span class="text-caption text-grey-darken-1">{{ notif.time }}</span>
                </v-list-item-action>
              </v-list-item>
            </v-list>
  
            <v-alert
              v-if="notifications.length === 0"
              type="info"
              class="mt-4"
              border="start"
              variant="tonal"
            >
              Tidak ada notifikasi saat ini.
            </v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useNotificationService } from '@/composables/useNotification'

definePageMeta({
  layout: 'profile',
})

const { getNotifications, markAsRead } = useNotificationService()
const notifications = ref([])

const loadNotifications = async () => {
  const { data, error } = await getNotifications()
  if (data.value) {
    notifications.value = data.value.notifications.map(n => ({
      id: n.id,
      title: getTitle(n.type),
      message: n.message,
      time: formatDate(n.created_at),
      read: n.is_read,
    }))
  } else if (error.value) {
    console.error('Gagal mengambil notifikasi:', error.value)
  }
}

const getTitle = (type) => {
  switch (type) {
    case 'apply':
      return 'Pengajuan Studi Kasus'
    case 'review':
      return 'Tinjauan Laporan'
    case 'weekly-report':
      return 'Laporan Mingguan'
    default:
      return 'Notifikasi'
  }
}

const formatDate = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

const markAsReadLocal = async (notif) => {
  if (notif.read) return
  notif.read = true
  await markAsRead(notif.id)
}

loadNotifications()
</script>
  
  <style scoped>
  .fill-height {
    height: 100vh;
  }
  
  .notification-item {
    transition: background-color 0.3s;
    cursor: pointer;
  }
  
  .notification-item:hover {
    background-color: #e3f2fd !important;
  }
  </style>
  