// composables/useNotificationIndicator.ts
import { ref, computed, onMounted } from 'vue'
import { useNotificationService } from '@/composables/useNotification'

const unreadCount = ref<number>(0)
const loaded = ref<boolean>(false)

export const useNotificationIndicator = () => {
  const { getNotifications } = useNotificationService()

  interface Notification {
    is_read: boolean;
    // add other properties if needed
  }

  interface NotificationsResponse {
    notifications: Notification[];
    // add other properties if needed
  }

  const loadUnreadNotifications = async () => {
    const { data } = await getNotifications();
    const notificationsData = data.value as NotificationsResponse | undefined;
    if (notificationsData && notificationsData.notifications) {
      unreadCount.value = notificationsData.notifications.filter(n => !n.is_read).length;
    }
    loaded.value = true;
  }

  const hasUnread = computed(() => unreadCount.value > 0)

  onMounted(() => {
    if (!loaded.value) loadUnreadNotifications()
  })

  return { unreadCount, hasUnread, reloadUnread: loadUnreadNotifications }
}
