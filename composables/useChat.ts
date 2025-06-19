// composables/useChat.ts
export const useChat = (studentId: string) => {
    const config = useRuntimeConfig()
    const { data, pending, error, refresh } = useFetch(
      () => `${config.public.apiBase}/api/chatrooms/student/${studentId}`,
      {
        key: `chatroom-${studentId}`,
        server: false,
        credentials: 'include',
      }
    )
  
    return { chatroom: data, pending, error, refresh }
  }