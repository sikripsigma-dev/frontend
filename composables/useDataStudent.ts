// composables/useStudentService.ts
export const useStudentService = () => {
  const config = useRuntimeConfig()

  const getStudentsBySupervisor = () =>
    useFetch(() => `${config.public.apiBase}/api/supervisor/students`, {
      credentials: 'include'
    })

  const getStudentDetail = (userId: string) =>
    useFetch(() => `${config.public.apiBase}/api/detail/student/${userId}`, {
      credentials: 'include'
    })

  return { getStudentsBySupervisor, getStudentDetail }
}
