export const useMonitoringProgressService = () => {
  const config = useRuntimeConfig()

  const submitSupervisorFeedback = (payload: {
    weekly_report_id: number
    feedback: string
    status: string
  }) =>
    useFetch(() => `${config.public.apiBase}/api/feedback/supervisor`, {
      method: 'POST',
      credentials: 'include',
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  const submitCompanyFeedback = (payload: {
    weekly_report_id: number
    feedback: string
    status: string
  }) =>
    useFetch(() => `${config.public.apiBase}/api/feedback/company`, {
      method: 'POST',
      credentials: 'include',
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    

  return { submitSupervisorFeedback, submitCompanyFeedback }
}
