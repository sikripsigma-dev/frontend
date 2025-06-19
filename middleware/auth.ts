export default defineNuxtRouteMiddleware(async () => {
  const { fetchUser, isAuthenticated } = useAuth()
  await fetchUser()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
