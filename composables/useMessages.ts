// composables/useMessages.ts
export const useMessages = (roomId: string) => {
    const config = useRuntimeConfig()
    const { data, pending, error, refresh } = useFetch(() =>
      `${config.public.apiBase}/api/chatrooms/messages/${roomId}`, {
        key: `messages-${roomId}`,
        server: false,
        credentials: 'include',
      }
    )
  
    return { messages: data, pending, error, refresh }
  }
  