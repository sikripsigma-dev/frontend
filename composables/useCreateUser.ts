export const useCreateUserService = () => {
  const config = useRuntimeConfig()

  const addUser = async (payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/api/user-create`, {
      method: 'POST',
      body: payload,
      credentials: 'include'
    })

    return { data, error }
  }

  const getUserCreations = () =>
      useFetch(() => `${config.public.apiBase}/api/user-create`, {
        credentials: 'include'
      })

  return { addUser , getUserCreations}
}
