export const useWeeklyReportService = () => {
    const config = useRuntimeConfig()
  
    const submitReport = (formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
    
    const submitCompanyReport = (formData: FormData) =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report/company`, {
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

    const getReportsByCompany = () =>
      useFetch(() => `${config.public.apiBase}/api/weekly-report/bycompany`, {
        credentials: 'include'
      })
  
    return { submitReport, submitCompanyReport, getMyReports, getReportsBySupervisor, getReportsByCompany }
  }
  