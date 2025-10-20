export const useUserManagement = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getAllUsers = () =>
    useFetch(() => `${base}/api/users`, { credentials: 'include' })

  // buat prefill Headstudy (ambil relasi)
  const getUserDetail = (id: string) =>
    useFetch(() => `${base}/api/user/${id}`, { credentials: 'include' })

  // kirim JSON (perlu utk field kaprodi)
  const updateUser = (id: string, payload: any) =>
    useFetch(() => `${base}/api/user/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    })

  return { getAllUsers, getUserDetail, updateUser }
}
