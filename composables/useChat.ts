// composables/useChat.ts
export const useChat = (id: string, role: string) => {
  const config = useRuntimeConfig()
  const endpoint =
    role === 'student'
      ? `/api/chatrooms/student/${id}`
      : `/api/chatrooms/company/${id}`

  const { data, pending, error, refresh } = useFetch(
    () => `${config.public.apiBase}${endpoint}`,
    {
      key: `chatroom-${id}`,
      server: false,
      credentials: 'include',
    }
  )

  return { chatroom: data, pending, error, refresh }
}
