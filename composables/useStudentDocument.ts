export const useStudentDocument = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBase

  const documents = ref<any[]>([])
  const loading = ref(false)
  const error = ref<unknown | null>(null)

  // Ambil dokumen milik user
  const getMyDocuments = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<{ data: any[] }>(`${apiUrl}/api/student/document`, {
        method: 'GET',
        credentials: 'include',
      })
      documents.value = res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Upload dokumen baru
  const uploadDocument = async (formData: FormData) => {
    try {
      const res = await $fetch(`${apiUrl}/api/student/document`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      return res
    } catch (err) {
      throw err
    }
  }

  return {
    documents,
    loading,
    error,
    getMyDocuments,
    uploadDocument,
  }
}