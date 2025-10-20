// composables/useDataUniversity.ts
import { ref } from 'vue'

type University = {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

type ApiListResponse = { success: boolean; data: University[]; message?: string; error?: string }
type ApiOneResponse  = { success: boolean; data?: University; message?: string; error?: string }

export const useDataUniversity = () => {
  const config = useRuntimeConfig()
  const universities = ref<University[]>([])
  const pending = ref(false)
  const error = ref<any>(null)
  const success = ref<boolean | null>(null)

  const apiBase = config.public.apiBase

  const getUniversities = async () => {
    try {
      pending.value = true
      error.value = null
      const res = await $fetch<ApiListResponse>(`${apiBase}/api/university`, {
        credentials: 'include'
      })
      universities.value = (res.data || []).map(u => ({
        id: u.id,
        name: u.name,
        created_at: (u as any).created_at,
        updated_at: (u as any).updated_at
      }))
      success.value = true
    } catch (err) {
      error.value = err
      success.value = false
    } finally {
      pending.value = false
    }
  }

  const createUniversity = async (data: { name: string }) => {
    try {
      pending.value = true
      error.value = null
      const res = await $fetch<ApiOneResponse>(`${apiBase}/api/university`, {
        method: 'POST',
        body: data,
        credentials: 'include'
      })
      // push item baru kalau ada di response; kalau tidak, re-fetch
      if (res.data) {
        universities.value.unshift(res.data)
      } else {
        await getUniversities()
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

  const updateUniversity = async (id: string, data: { name: string }) => {
    try {
      pending.value = true
      error.value = null
      await $fetch<ApiOneResponse>(`${apiBase}/api/university/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include'
      })
      // update di client
      const i = universities.value.findIndex(u => u.id === id)
      if (i >= 0) {
        universities.value[i] = { ...universities.value[i], name: data.name, updated_at: new Date().toISOString() }
      } else {
        await getUniversities()
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

  const deleteUniversity = async (id: string) => {
    try {
      pending.value = true
      error.value = null
      await $fetch(`${apiBase}/api/university/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      universities.value = universities.value.filter(u => u.id !== id)
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
    universities,
    pending,
    error,
    success,
    getUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity
  }
}
