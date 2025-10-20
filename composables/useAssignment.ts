// composables/useAssignment.ts
import { useRuntimeConfig, useFetch } from '#app'

export interface Assignment {
  id: number
  status: string
  started_at: string
  ended_at?: string | null
  research_case?: {
    id?: string
    title: string
  }
}

export const useAssignmentService = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  // Tetap dipakai oleh progress_report (ambil assignment aktif user)
  const getMyAssignment = () =>
    useFetch<{ data: Assignment }>(`${base}/api/assignment/active`, {
      credentials: 'include',
    })

  // List semua assignment milik mahasiswa login
  const listMyAssignments = () =>
    useFetch<{ data: Assignment[] }>(`${base}/api/assignments/mine`, {
      credentials: 'include',
    })

  // Generate sertifikat untuk assignment tertentu → kembalikan Blob (PDF)
  const downloadCertificateById = async (id: number): Promise<Blob> => {
    const blob = await $fetch(`${base}/api/assignments/${id}/certificate`, {
      method: 'GET',
      credentials: 'include',
      responseType: 'blob',
    })
    return blob as Blob
  }

  // Helper: langsung trigger download ke file .pdf di browser
  const downloadCertificateToFile = async (
    id: number,
    filename?: string
  ): Promise<void> => {
    const blob = await downloadCertificateById(id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `Sertifikat_${id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Company endpoint (jika dibutuhkan pada halaman perusahaan)
  const getByCompany = () =>
    useFetch(`${base}/api/assignment/company`, {
      credentials: 'include',
    })

  // Ubah status assignment (admin/company)
  const updateStatus = (id: number, status: string) =>
    $fetch(`${base}/api/assignment/${id}/status`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })

  return {
    getMyAssignment,
    listMyAssignments,
    downloadCertificateById,
    downloadCertificateToFile,
    getByCompany,
    updateStatus,
  } as const
}
