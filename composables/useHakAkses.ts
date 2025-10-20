import { useRuntimeConfig } from '#app'

export type Role = { id: number; name: string }

export type MenuAccessNode = {
  id: number
  name: string
  url?: string | null
  icon?: string
  is_active: boolean
  parent_id?: number | null
  can_view?: boolean
  can_add?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_approve?: boolean
  can_export?: boolean
  children?: MenuAccessNode[]
}

export type UpdateMenuAccessItem = {
  menu_id: number
  can_view: boolean
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
  can_approve: boolean
  can_export: boolean
}

export const useHakAkses = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // state global agar cached antar navigasi
  const roles      = useState<Role[]>('hakakses-roles', () => [])
  const rolesPend  = useState<boolean>('hakakses-roles-pend', () => false)
  const rolesErr   = useState<any>('hakakses-roles-err', () => null)

  const menuTree   = useState<MenuAccessNode[]>('hakakses-menutree', () => [])
  const accessPend = useState<boolean>('hakakses-access-pend', () => false)
  const accessErr  = useState<any>('hakakses-access-err', () => null)

  const fetchRoles = async () => {
    rolesPend.value = true
    rolesErr.value = null
    try {
        // ⬇️ perhatikan tipe responsenya { roles: Role[] }
        const res = await $fetch<{ roles: Role[] }>(`${apiBase}/api/role    `, {
        credentials: 'include'
        })
        roles.value = res.roles || []
    } catch (e) {
        rolesErr.value = e
        roles.value = []
    } finally {
        rolesPend.value = false
    }
    }

  const fetchMenuAccessByRole = async (roleId: number) => {
    if (!roleId) return
    accessPend.value = true
    accessErr.value = null
    try {
      const res = await $fetch<{ menus: MenuAccessNode[] }>(
        `${apiBase}/api/roles/${roleId}/menu-access`,
        { credentials: 'include' }
      )
      menuTree.value = res?.menus || []
    } catch (e) {
      accessErr.value = e
      menuTree.value = []
    } finally {
      accessPend.value = false
    }
  }

  const updateMenuAccessBulk = async (roleId: number, items: UpdateMenuAccessItem[]) => {
    await $fetch(`${apiBase}/api/roles/${roleId}/menu-access`, {
      method: 'PUT',
      body: { items },
      credentials: 'include'
    })
  }

  return {
    // state
    roles, rolesPend, rolesErr,
    menuTree, accessPend, accessErr,

    // actions
    fetchRoles,
    fetchMenuAccessByRole,
    updateMenuAccessBulk,
  }
}
