// composables/useAuth.ts
export const useAuth = () => {
  const config = useRuntimeConfig();
  const user = useState<User | null>('user', () => null);
  const authLoading = useState<boolean>('auth-loading', () => true);
  const hasFetchedUser = useState<boolean>('has-fetched-user', () => false);

  type User = {
    id: string;
    name: string;
    email: string;
    photo?: string;
    nim?: string;
    phone?: string;
    role?: number;
  };

  const login = async (email: string, password: string) => {
    try {
      await $fetch(`${config.public.apiBase}/api/login`, {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
      });

      // force fetch user setelah login
      await fetchUser(true);
      await nextTick();
    } catch (error: any) {
      throw createError({
        statusCode: error?.status || 500,
        message: error?.data?.error || 'Login failed',
      });
    }
  };

  const logout = async () => {
    try {
      await $fetch(`${config.public.apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    user.value = null;
    hasFetchedUser.value = false; // reset biar bisa fetch lagi kalau login ulang
    await navigateTo('/login');
  };

  const fetchUser = async (force = false) => {
    // kalau sudah pernah fetch dan tidak force, skip
    if (hasFetchedUser.value && !force) return;

    authLoading.value = true;
    try {
      const res = await $fetch<{ user: User }>(`${config.public.apiBase}/api/user`, {
        credentials: 'include',
      });
      user.value = res.user;
    } catch {
      user.value = null;
    } finally {
      authLoading.value = false;
      hasFetchedUser.value = true;
    }
  };

  const isAuthenticated = computed(() => !!user.value);

  return {
    user,
    login,
    logout,
    fetchUser,
    isAuthenticated,
    isLoggedIn: isAuthenticated,
    authLoading,
  };
};
