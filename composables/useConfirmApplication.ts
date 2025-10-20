import { useRuntimeConfig, useFetch } from '#app'

export const useConfirmApplicationService = () => {
  const config = useRuntimeConfig()

  const getApplication = () => {
    return useFetch<{ data: Assignment }>(
      `${config.public.apiBase}/api/application/pending/headstudy`,
      { credentials: 'include' }
    )
  }

  const confirmApplication = (id: number, decision: 'accepted' | 'rejected') => {
    return useFetch(`${config.public.apiBase}/api/application/headstudy/confirm/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ decision }),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
  }


  return { getApplication, confirmApplication }
}
