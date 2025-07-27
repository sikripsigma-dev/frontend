import { useDebounce } from "@vueuse/core"

export interface ResearchCase {
  id: string
  title: string
  description: string
  location: string
  education_requirement: string
  tags?: string[]
  company: {
    Name: string
    Address: string
    logo?: string
  }
}

type ApplicationCheckResponse = {
  applied: boolean
  assigned: boolean
  eligible: boolean
}

export const useResearchCase = () => {
  const config = useRuntimeConfig()

  const researchCases = useState<ResearchCase[]>('research-cases', () => [])
  const loading = useState<boolean>('research-loading', () => false)
  const error = useState<string | null>('research-error', () => null)

  const selectedCompany = useState<ResearchCase | null>('selected-company', () => null)
  const selectedLocation = useState<string>('selected-location', () => 'Semua Lokasi')
  const currentPage = useState<number>('research-current-page', () => 1)
  const searchQuery = useState<string>('research-search-query', () => '')

  const itemsPerPage = 3

  const fetchResearchCases = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<{ research_cases: ResearchCase[] }>(
        `${config.public.apiBase}/api/research-case`,
        { credentials: 'include' }
      )
      researchCases.value = res.research_cases
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Gagal memuat data'
    } finally {
      loading.value = false
    }
  }

  const applyToCase = async (researchCaseId: string) => {
    try {
      const res = await $fetch(`${config.public.apiBase}/api/application`, {
        method: 'POST',
        body: { research_case_id: researchCaseId },
        credentials: 'include',
      })
      return { success: true, data: res }
    } catch (err: any) {
      return {
        success: false,
        error: err?.data?.error || err?.message || 'Gagal apply',
      }
    }
  }

  // const checkIfApplied = async (researchCaseId: string): Promise<boolean> => {
  //   try {
  //     const res = await $fetch<{ applied: boolean }>(
  //       `${config.public.apiBase}/api/application/check`,
  //       {
  //         method: 'GET',
  //         params: { research_case_id: researchCaseId },
  //         credentials: 'include',
  //       }
  //     )
  //     return res.applied
  //   } catch (e) {
  //     console.error('Gagal cek status apply:', e)
  //     return false
  //   }
  // }

  const checkIfApplied = async (researchCaseId: string): Promise<ApplicationCheckResponse> => {
    try {
      const res = await $fetch<ApplicationCheckResponse>(
        `${config.public.apiBase}/api/application/check`,
        {
          method: 'GET',
          params: { research_case_id: researchCaseId },
          credentials: 'include',
        }
      )
      return res
    } catch (e) {
      console.error('Gagal cek status apply:', e)
      return {
        applied: false,
        assigned: false,
        eligible: false,
      }
    }
  }

  const debouncedQuery = useDebounce(searchQuery, 300)

  const filteredCases = computed(() => {
    let filtered = researchCases.value

    if (selectedLocation.value && selectedLocation.value !== 'Semua Lokasi') {
      filtered = filtered.filter(item =>
        item.location?.toLowerCase().includes(selectedLocation.value.toLowerCase())
      )
    }

    if (debouncedQuery.value.trim() !== '') {
      const query = debouncedQuery.value.toLowerCase()
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.company?.Name?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const paginatedCases = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredCases.value.slice(start, start + itemsPerPage)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredCases.value.length / itemsPerPage)
  )

  const selectCompany = (caseItem: ResearchCase | null) => {
    selectedCompany.value = caseItem
  }

  const setLocationFilter = (location: string) => {
    selectedLocation.value = location
  }

  return {
    researchCases,
    selectedCompany,
    selectedLocation,
    searchQuery,
    currentPage,
    totalPages,
    paginatedCases,
    filteredCases,
    loading,
    error,

    fetchResearchCases,
    selectCompany,
    setLocationFilter,
    applyToCase,
    checkIfApplied,
  }
}
