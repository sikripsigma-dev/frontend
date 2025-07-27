// composables/useChat.ts
export const useChat = (id: string, role: string) => {
  const config = useRuntimeConfig()
  
  // Determine the endpoint based on user role
  const endpoint = (() => {
    // switch(role) {
    //   case 'student':
    //     return `/api/my-chatrooms/`
    //   case 'company':
    //     return `/api/chatrooms/company/${id}`
    //   case 'supervisor':
    //     return `/api/chatrooms/supervisor/${id}`
    //   default:
    //     throw new Error(`Invalid role: ${role}`)
    // }
      return `/api/my-chatrooms/`
  })()

  const { data, pending, error, refresh } = useFetch(
    () => `${config.public.apiBase}${endpoint}`,
    {
      key: `chatroom-${role}-${id}`, // Include role in key to prevent cache conflicts
      server: false,
      credentials: 'include',
    }
  )

  return { chatroom: data, pending, error, refresh }
}