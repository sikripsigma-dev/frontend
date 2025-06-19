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
          {
            credentials: 'include',
          }
        )
        
        if (!Array.isArray(res?.research_cases)) {
          console.error('Invalid data structure received:', res)
          throw new Error('Invalid research case data structure')
        }
        
        researchCases.value = res.research_cases
        console.log('Research cases loaded:', researchCases.value)
      } catch (err: any) {
        console.error('Fetch error:', err)
        error.value = err?.data?.message || err?.message || 'Gagal memuat data'
      } finally {
        loading.value = false
      }
    }
      
  
    const filteredCases = computed(() => {
      if (!Array.isArray(researchCases.value)) return []
  
      let filtered = researchCases.value
  
      if (selectedLocation.value && selectedLocation.value !== 'Semua Lokasi') {
        filtered = filtered.filter((item) =>
          item.location?.toLowerCase().includes(selectedLocation.value.toLowerCase())
        )
      }
  
      if (searchQuery.value.trim() !== '') {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (item) =>
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
    }
  }
  