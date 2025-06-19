// composables/useAuth.ts
export const useAuth = () => {
  const config = useRuntimeConfig();
  const token = useCookie('token', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
  });

  const user = useState<User | null>('user', () => null);

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
      const res = await $fetch<{ token: string }>(`${config.public.apiBase}/api/login`, {
        method: 'POST',
        body: { email, password },
      });

      token.value = res.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.token); // simpan juga ke localStorage jika mau
      }

      await nextTick(); // pastikan token.value sinkron
      await fetchUser();

      return res;
    } catch (error: any) {
      throw createError({
        statusCode: error?.status || 500,
        message: error?.data?.error || "Login failed"
      });
    }
  };

  const logout = async () => {
    try {
      // Panggil API logout agar cookie terhapus
      await $fetch(`${config.public.apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include', // penting agar cookie ikut terkirim
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  
    // Hapus localStorage jika ada
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  
    // Hapus token & user di state
    token.value = null;
    user.value = null;
  
    // Redirect opsional
    await navigateTo('/login');
  };  

  const fetchUser = async () => {
    let currentToken = token.value;
    if (!currentToken && typeof window !== 'undefined') {
      currentToken = localStorage.getItem('token') || '';
    }

    if (!currentToken) return null;

    try {
      const res = await $fetch<{ user: User }>(`${config.public.apiBase}/api/user`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      user.value = res.user;
      return res.user;
    } catch (error) {
      logout();
      return null;
    }
  };

  const isAuthenticated = computed(() => {
    if (!token.value && typeof window !== 'undefined') {
      const localToken = localStorage.getItem('token');
      if (!localToken) return false;

      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    }

    if (token.value) {
      try {
        const payload = JSON.parse(atob(token.value.split(".")[1]));
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    }

    return false;
  });

  return {
    user,
    token,
    login,
    logout,
    fetchUser,
    isAuthenticated,
    isLoggedIn: computed(() => !!user.value)
  };
};
