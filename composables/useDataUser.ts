export const useDataUser = () => {
  const config = useRuntimeConfig();
  
  const { data, pending, error, refresh } = useFetch(() => `${config.public.apiBase}/api/user`, {
    key: 'user',
    credentials: 'include',
    transform: (res: any) => res.user
  });
  

  const updateUser = async (profileData: any) => {
    try {
      await $fetch(`${config.public.apiBase}/api/profile`, {
        method: 'PUT',
        body: profileData,
        credentials: 'include',
      });
      await refresh(); 
      return { success: true };
    } catch (err) {
      console.error('Update profile failed', err);
      return { success: false, error: err };
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await $fetch<{ url: string }>(`${config.public.apiBase}/api/profile/photo`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      await refresh();  // refresh user info setelah upload foto
      return { success: true, url: res.url };
    } catch (err) {
      console.error('Upload profile photo failed', err);
      return { success: false, error: err };
    }
  };

  return { user: data, pending, error, refresh, updateUser, uploadProfilePhoto };
};
