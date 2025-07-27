export const useUserManagement = () => {
    const config = useRuntimeConfig()
  
    const getAllUsers = () =>
      useFetch(() => `${config.public.apiBase}/api/users`, {
        credentials: 'include'
      })

    const updateUser = (id: string, formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/user/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      })
  
    return { getAllUsers, updateUser }
  }
  