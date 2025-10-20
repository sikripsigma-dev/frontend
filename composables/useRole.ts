// composables/useRoles.ts
export type Role = { id: number; name: string }

export const useRoles = () => {
  const config = useRuntimeConfig()
  const api = config.public.apiBase

  const roles   = useState<Role[]>('roles-list', () => [])
  const pending = useState<boolean>('roles-pending', () => false)
  const error   = useState<any>('roles-error', () => null)

  const fetchRoles = async () => {
    pending.value = true
    error.value = null
    try {
      const res = await $fetch<{ roles: Role[] }>(`${api}/api/role`, { credentials: 'include' })
      roles.value = res.roles ?? []
    } catch (e) {
      error.value = e
      roles.value = []
    } finally {
      pending.value = false
    }
  }

  const createRole = async (payload: { name: string }) => {
    await $fetch(`${api}/api/role`, {
      method: 'POST',
      body: payload,
      credentials: 'include',
    })
    await fetchRoles()
  }

  const updateRole = async (id: number, payload: { name: string }) => {
    await $fetch(`${api}/api/role/${id}`, {
      method: 'PUT',
      body: payload,
      credentials: 'include',
    })
    await fetchRoles()
  }

  // opsional, kalau BE sudah ada
  const deleteRole = async (id: number) => {
    await $fetch(`${api}/api/role/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchRoles()
  }

  return { roles, pending, error, fetchRoles, createRole, updateRole, deleteRole }
}
