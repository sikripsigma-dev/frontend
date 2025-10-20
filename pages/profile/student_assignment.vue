<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Daftar Assignment Saya</h1>
        <p class="text-body-2 text-medium-emphasis">Unduh sertifikat pada assignment yang sudah selesai.</p>
      </div>
    </div>

    <v-card elevation="2" rounded="lg">
      <v-card-text>
        <v-skeleton-loader v-if="pending" type="table" />
        <v-alert v-else-if="error" type="error" variant="tonal">Gagal memuat assignment.</v-alert>

        <v-data-table
          v-else
          :headers="headers"
          :items="rows"
          item-key="id"
          :items-per-page="10"
          density="comfortable"
          class="elevation-1"
        >
          <template #item.period="{ item }">
            <span>
              {{ format(item.started_at) }}
              <span v-if="item.ended_at"> — {{ format(item.ended_at) }}</span>
            </span>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="item.status === 'completed' ? 'success' : 'info'" size="small" label>
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              :disabled="!canDownload(item)"
              :loading="downloadingId === item.id"
              @click="download(item)"
            >
              <v-icon start>mdi-download</v-icon> Sertifikat
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="!pending && rows.length === 0" class="text-caption text-medium-emphasis mt-4">
          Belum ada assignment.
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'profile' })

import { computed, ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAssignmentService, type Assignment } from '@/composables/useAssignment'

const toast = useToast()
const { listMyAssignments, downloadCertificateById } = useAssignmentService()

const headers = [
  { title: 'Judul Studi Kasus', key: 'title' },
  { title: 'Periode', key: 'period' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Aksi', key: 'actions', align: 'end', sortable: false, width: 170 },
]

const rows = ref<(Assignment & { title: string })[]>([])
const pending = ref(false)
const error = ref<any>(null)
const downloadingId = ref<number | null>(null)

const load = async () => {
  pending.value = true
  error.value = null
  const { data, error: err } = await listMyAssignments()
  if (data.value) {
    rows.value = data.value.data.map(a => ({
      ...a,
      title: a.research_case?.title || '-'
    }))
  } else {
    error.value = err.value
  }
  pending.value = false
}

const canDownload = (a: Assignment) => a.status === 'completed' && !!a.ended_at

const format = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const download = async (a: Assignment & { title: string }) => {
  if (!canDownload(a)) {
    toast.error('Sertifikat hanya untuk assignment yang telah selesai.')
    return
  }
  try {
    downloadingId.value = a.id
    const blob = await downloadCertificateById(a.id)
    const url = URL.createObjectURL(blob)
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.download = `Sertifikat_${a.title.replace(/\s+/g,'_')}.pdf`
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag)
    URL.revokeObjectURL(url)
  } catch (e: any) {
    toast.error(e?.data?.message || 'Gagal mengunduh sertifikat')
  } finally {
    downloadingId.value = null
  }
}

onMounted(load)
</script>
