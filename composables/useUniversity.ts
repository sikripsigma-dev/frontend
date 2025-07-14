export const useUniversityService = () => {
    const config = useRuntimeConfig()
  
    const addUniversity = (formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
  
    const getUniversity = () =>
      useFetch(() => `${config.public.apiBase}/api/university`, {
        credentials: 'include'
      })

    const updateUniversity = (id: string, formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/university/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      })
  
    return { addUniversity, getUniversity, updateUniversity }
  }
  