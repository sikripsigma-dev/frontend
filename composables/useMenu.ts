export const useMenu = () => {
  const config = useRuntimeConfig()
  const { data, pending, error, refresh } = useFetch(() => `${config.public.apiBase}/api/menu`, {
    key: 'menu',
    server: false,
    credentials: 'include',
  })

  return { menu: data, pending, error, refresh }
}
