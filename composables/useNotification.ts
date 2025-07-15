export const useNotificationService = () => {
    const config = useRuntimeConfig()
  
    const getNotifications = () =>
      useFetch(() => `${config.public.apiBase}/api/notifications`, {
        credentials: 'include',
      })
  
    const markAsRead = (id: string) =>
      useFetch(() => `${config.public.apiBase}/api/notifications/${id}/true`, {
        method: 'PUT',
        credentials: 'include',
      })
  
    return { getNotifications, markAsRead }
  }
  