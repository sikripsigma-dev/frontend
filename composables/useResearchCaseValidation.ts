// composables/useResearchCaseValidation.ts
export const useResearchCaseValidation = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  // list research case untuk kaprodi
  const getResearchCase = () =>
    useFetch<ResearchCasesResponse>(`${base}/api/research-case/headstudy`, {
      credentials: 'include',
    })

  // list komentar
  const getComments = (researchCaseId: string) =>
    useFetch(`${base}/api/research-case/${researchCaseId}/comments`, {
      credentials: 'include',
    })

  // tambah komentar (ProgramHead diambil dari session BE)
  const addComment = (researchCaseId: string, comment: string) =>
    $fetch(`${base}/api/research-case/${researchCaseId}/comments`, {
      method: 'POST',
      body: { research_case_id: researchCaseId, comment },
      credentials: 'include',
    })

  // set status (upsert)
  const setValidationStatus = (
    researchCaseId: string,
    status: 'approved' | 'rejected' | 'pending'
  ) =>
    $fetch(`${base}/api/research-case/validation?research_case_id=${researchCaseId}`, {
      method: 'POST',
      body: { status, research_case_id: researchCaseId }, // kirim juga di body
      credentials: 'include',
    })

  return { getResearchCase, getComments, addComment, setValidationStatus }
}
