import { useRuntimeConfig, useFetch } from '#app'

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  description: string
}

export interface Tag {
  id: string
  name: string
}

export interface ResearchCase {
  id: string
  title: string
  field: string
  location?: string
  education_requirement?: string
  duration?: string
  description?: string
  created_at?: string
  tags?: Tag[]
  company: Company
}

export interface Application {
  id: number
  status: string
  AppliedAt: string
  ProcessedAt: string
  ProcessedBy: string
  research_case: ResearchCase
}

export interface ApplicationsResponse {
  applications: Application[]
  message: string
}

export const useApplicationService = () => {
  const config = useRuntimeConfig()

  const getByResearchCase = (researchCaseId: string) => {
    return useFetch(() => 
      `${config.public.apiBase}/api/application/research-case/${researchCaseId}`,
      {
        credentials: 'include'
      }
    )
  }

  // by company
  const processApplication = (applicationId: string, status: string) => {
    return $fetch(`${config.public.apiBase}/api/application/review/${applicationId}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  const getByStudent = (studentId: string) => {
    return useFetch<ApplicationsResponse>(
      `${config.public.apiBase}/api/application/student/${studentId}`,
      {
        credentials: 'include',
      }
    )
  }

  const respondToApplication = (applicationId: string, status: string) => {
    return $fetch(`${config.public.apiBase}/api/application/respond-to/${applicationId}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  return { getByResearchCase, processApplication, getByStudent, respondToApplication }
}
