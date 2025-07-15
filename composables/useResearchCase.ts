export interface Company {
  id: string
  Name: string
  email: string
  phone: string
  address: string
  description: string
}

export interface ResearchCase {
  id: string
  company_id?: string
  title: string
  field: string
  location?: string
  education_requirement?: string
  duration?: string
  description?: string
  created_at?: string
  company: Company
}
  
  export interface ResearchCasesResponse {
    research_cases: ResearchCase[]
  }
  
  export interface ResearchCaseResponse {
    research_case: ResearchCase
  }
  
  export const useResearchCaseService = () => {
    const config = useRuntimeConfig()
  
    // GET all by company
    const getByCompany = (companyId: string) => {
      return useFetch<ResearchCasesResponse>(
        `${config.public.apiBase}/api/research-case/company/${companyId}`,
        {
          credentials: 'include',
        }
      )
    }

    const getByStudent = (studentId: string) => {
      return useFetch<ResearchCasesResponse>(
        `${config.public.apiBase}/api/research-case/student/${studentId}`,
        {
          credentials: 'include',
        }
      )
    }
  
    // GET by ID
    const getById = (id: string) => {
      return useFetch<ResearchCaseResponse>(
        `${config.public.apiBase}/api/research-case/${id}`,
        {
          credentials: 'include',
        }
      )
    }
  
    // CREATE
    const create = (payload: Partial<ResearchCase>) => {
      return $fetch(`${config.public.apiBase}/api/research-case`, {
        method: 'POST',
        body: payload,
        credentials: 'include',
      })
    }
  
    // UPDATE
    const update = (id: string, payload: Partial<ResearchCase>) => {
      return $fetch(`${config.public.apiBase}/api/research-case/${id}`, {
        method: 'PUT',
        body: payload,
        credentials: 'include',
      })
    }
  
    // DELETE
    const remove = (id: string) => {
      return $fetch(`${config.public.apiBase}/api/research-case/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    }
  
    return { getByCompany, getById, create, update, remove }
  }
  