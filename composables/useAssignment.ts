import { useRuntimeConfig, useFetch } from '#app'

export interface Assignment {
  id: number
  research_case: {
    title: string
  }
}

export const useAssignmentService = () => {
  const config = useRuntimeConfig()

  const getMyAssignment = () => {
    return useFetch<{ data: Assignment }>(
      `${config.public.apiBase}/api/assignment/active`,
      { credentials: 'include' }
    )
  }

  const getByCompany = () => {
    return useFetch(`${config.public.apiBase}/api/assignment/company`, {
      credentials: 'include',
    })
  }

  const updateStatus = (id: number, status: string) => {
    return $fetch(`${config.public.apiBase}/api/assignment/${id}/status`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }


  return { getMyAssignment, getByCompany, updateStatus }
}
