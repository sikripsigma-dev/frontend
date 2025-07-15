// export default defineNuxtRouteMiddleware(async (to, from) => {
//   if (process.server) {
//     console.log('🌐 Skip API check on server');
//     return;
//   }

//   const config = useRuntimeConfig();

//   try {
//     console.log('🌐 Client fetch:', `${config.public.apiBase}/api/user`);
//     await $fetch(`${config.public.apiBase}/api/user`, { credentials: 'include' });
//     console.log('✅ Valid session, allow access');
//   } catch {
//     console.log('❌ Invalid session, redirecting to /login');
//     return navigateTo('/login');
//   }
// });

export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return;

  const { refresh, user } = useDataUser();

  try {
    await refresh();

    if (!user.value) {
      console.log('❌ User not logged in, redirecting...');
      return navigateTo('/login');
    }

    console.log('✅ Authenticated:', user.value?.user?.email || '[No email]');
  } catch (err) {
    console.error('❌ Failed to validate session:', err);
    return navigateTo('/login');
  }
});
