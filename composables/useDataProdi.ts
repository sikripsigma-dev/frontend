import { ref } from 'vue'

type Prodi = {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

type ApiListResponse = { success: boolean; data: Prodi[]; message?: string; error?: string }
type ApiOneResponse  = { success: boolean; data?: Prodi; message?: string; error?: string }

export const useDataProdi = () => {
  const config = useRuntimeConfig()
  const prodis = ref<Prodi[]>([])
  const pending = ref(false)
  const error = ref<any>(null)
  const success = ref<boolean | null>(null)

  const apiBase = config.public.apiBase

  const getProdis = async () => {
    try {
      pending.value = true
      error.value = null
      const res = await $fetch<ApiListResponse>(`${apiBase}/api/study-program`, {
        credentials: 'include'
      })
      prodis.value = (res.data || []).map(p => ({
        id: p.id,
        name: p.name,
        created_at: (p as any).created_at,
        updated_at: (p as any).updated_at
      }))
      success.value = true
    } catch (err) {
      error.value = err
      success.value = false
      throw err
    } finally {
      pending.value = false
    }
  }

  const createProdi = async (data: { name: string }) => {
    try {
      pending.value = true
      error.value = null
      const res = await $fetch<ApiOneResponse>(`${apiBase}/api/study-program`, {
        method: 'POST',
        body: data,
        credentials: 'include'
      })
      if (res.data) {
        prodis.value.unshift(res.data)
      } else {
        await getProdis()
      }
      success.value = true
    } catch (err) {
      error.value = err
      success.value = false
      throw err
    } finally {
      pending.value = false
    }
  }

  const updateProdi = async (id: string, data: { name: string }) => {
    try {
      pending.value = true
      error.value = null
      await $fetch<ApiOneResponse>(`${apiBase}/api/study-program/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include'
      })
      const i = prodis.value.findIndex(p => p.id === id)
      if (i >= 0) {
        prodis.value[i] = { ...prodis.value[i], name: data.name, updated_at: new Date().toISOString() }
      } else {
        await getProdis()
      }
      success.value = true
    } catch (err) {
      error.value = err
      success.value = false
      throw err
    } finally {
      pending.value = false
    }
  }

  const deleteProdi = async (id: string) => {
    try {
      pending.value = true
      error.value = null
      await $fetch(`${apiBase}/api/study-program/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      prodis.value = prodis.value.filter(p => p.id !== id)
      success.value = true
    } catch (err) {
      error.value = err
      success.value = false
      throw err
    } finally {
      pending.value = false
    }
  }

  return {
    prodis,
    pending,
    error,
    success,
    getProdis,
    createProdi,
    updateProdi,
    deleteProdi
  }
}
