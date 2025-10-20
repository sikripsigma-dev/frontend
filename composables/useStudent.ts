import { useRuntimeConfig, useFetch } from '#app'

interface Student {
  id: string
  name: string
  nim: string
  email: string
  phone: string
  avatar: string
  research_case_title: string
}

interface ApiResponse {
  data: Student[]
  message: string
}

export const useStudentService = () => {
  const config = useRuntimeConfig()

  const getStudentUniversity = () => {
    return useFetch<ApiResponse>(
      `${config.public.apiBase}/api/students/university`,
      {
        credentials: 'include',
      }
    )
  }

  return { getStudentUniversity }
}