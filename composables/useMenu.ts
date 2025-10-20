// composables/useMenu.ts
import { ref, computed } from 'vue'

type MenuNode = {
  id: number
  name: string
  url?: string | null
  icon?: string
  is_active: boolean
  parent_id?: number | null
  children?: MenuNode[]
}
type MenuTreeResponse = { menus: MenuNode[] }

export const useMenu = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // Shared state (persist di client antar komponen/halaman)
  const menusState   = useState<MenuNode[]>('menu-tree-state', () => [])
  const loadedState  = useState<boolean>('menu-tree-loaded', () => false)
  const pendingState = useState<boolean>('menu-tree-pending', () => false)
  const errorState   = useState<any>('menu-tree-error', () => null)

  const menus   = computed(() => menusState.value)
  const pending = computed(() => pendingState.value)
  const error   = computed(() => errorState.value)

  const fetchOnce = async () => {
    if (loadedState.value) return           // <-- cegah refetch
    pendingState.value = true
    errorState.value = null
    try {
      const res = await $fetch<MenuTreeResponse>(`${apiBase}/api/menu`, {
        credentials: 'include'
      })
      menusState.value = res.menus || []
      loadedState.value = true
    } catch (e) {
      errorState.value = e
      // biarkan loaded=false supaya bisa dicoba lagi
    } finally {
      pendingState.value = false
    }
  }

  const refresh = async () => {
    // force refetch (misal setelah create/update/delete)
    pendingState.value = true
    errorState.value = null
    try {
      const res = await $fetch<MenuTreeResponse>(`${apiBase}/api/menu`, {
        credentials: 'include'
      })
      menusState.value = res.menus || []
      loadedState.value = true
    } catch (e) {
      errorState.value = e
    } finally {
      pendingState.value = false
    }
  }

  const createMenu = async (payload: { name: string; url: string; icon?: string; is_active: boolean; parent_id: number | null }) => {
    await $fetch(`${apiBase}/api/menu`, { method: 'POST', body: payload, credentials: 'include' })
    await refresh()
  }

  const updateMenu = async (id: number, payload: { name: string; url: string; icon?: string; is_active: boolean; parent_id: number | null }) => {
    await $fetch(`${apiBase}/api/menu/${id}`, { method: 'PUT', body: payload, credentials: 'include' })
    await refresh()
  }

  const deleteMenu = async (id: number) => {
    await $fetch(`${apiBase}/api/menu/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  return { menus, pending, error, fetchOnce, refresh, createMenu, updateMenu, deleteMenu }
}
