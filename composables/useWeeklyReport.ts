export const useWeeklyReportService = () => {
    const config = useRuntimeConfig()
  
    const submitReport = (formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
  
    const getMyReports = () =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report`, {
        credentials: 'include'
      })

    const getReportsBySupervisor = () =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report/bysupervisor`, {
        credentials: 'include'
      })
  
    return { submitReport, getMyReports, getReportsBySupervisor }
  }
  