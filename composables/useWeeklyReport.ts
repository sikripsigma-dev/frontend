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
  
    // const getMyReports = () =>
    //   useFetch(() => `${config.public.apiBase}/api/weekly-report`, {
    //     credentials: 'include'
    //   })

    const getMyReports = (type: 'dosen' | 'perusahaan' = 'dosen') => 
    useFetch(() => `${config.public.apiBase}/api/weekly-report?type=${type}`, {
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

      // get feedback by weeklyreport
      const getSupervisorFeedback = (weeklyReportId: string) =>
      useFetch(() => `${config.public.apiBase}/api/feedback/supervisor/${weeklyReportId}`, {
        credentials: 'include'
      })
  
    return { submitReport, submitCompanyReport, getMyReports, getReportsBySupervisor, getReportsByCompany, getSupervisorFeedback}
  }
  