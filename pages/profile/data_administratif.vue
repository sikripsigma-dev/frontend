<template>
  <v-container class="document-upload-container">
    <v-row justify="center">
     <v-col cols="12" md="12">
        <!-- Header Card -->
        <v-card elevation="2" class="mb-6 pa-6 rounded-lg" color="primary-lighten-5">
          <v-card-text class="pa-0">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="x-large" class="mr-3">mdi-folder-account</v-icon>
              <h1 class="text-h4 font-weight-bold">Dokumen Pendukung</h1>
            </div>
            <p class="text-body-1 text-grey-darken-2">
              Lengkapi dokumen pendukung untuk proses administrasi dan transaksi akademik Anda.
              Pastikan dokumen yang diunggah valid dan dapat dibaca dengan jelas.
            </p>
          </v-card-text>
        </v-card>


        <!-- Help Section -->
        <v-alert
          type="info"
          variant="tonal"
          border="start"
          class="mb-6 rounded-lg"
        >
          <template #prepend>
            <v-icon class="mr-3">mdi-help-circle</v-icon>
          </template>
          <h3 class="text-h6 mb-2">Panduan Unggah Dokumen</h3>
          <ul class="pl-4 mb-0">
            <li>Pastikan dokumen yang diunggah jelas terbaca</li>
            <li>Ukuran maksimal setiap file adalah 2MB</li>
            <li>Format file yang diterima: PDF (untuk dokumen formal), JPG, PNG (untuk scan/foto)</li>
            <li>Transkrip dan surat harus dalam format PDF</li>
            <li>Klik ikon <v-icon small>mdi-download</v-icon> untuk mendapatkan template surat</li>
            <li>Dokumen akan diverifikasi oleh admin</li>
          </ul>
        </v-alert>

        <!-- Form Upload Dokumen -->
        <v-card elevation="2" class="mb-6 rounded-lg">
          <v-form ref="formRef" @submit.prevent="submit" lazy-validation>
            <v-card-title class="pa-6 pb-3">
              <h2 class="text-h6">Form Unggah Dokumen</h2>
            </v-card-title>
            
            <v-card-text class="pt-0 pb-0">
              <v-row>
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="form.ktp"
                    label="Kartu Tanda Penduduk (KTP)"
                    prepend-icon="mdi-card-account-details"
                    :rules="fileRules"
                    accept=".pdf,.jpg,.jpeg,.png"
                    outlined
                    dense
                    :hint="uploadedFiles.ktp ? `Terakhir diunggah: ${uploadedFiles.ktp}` : 'Format: PDF/JPG/PNG (max 2MB)'"
                    persistent-hint
                    :loading="loading.ktp"
                    :disabled="loading.ktp"
                  >
                    <template #append>
                      <v-btn
                        v-if="hasDocument('ktp')"
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="viewDocument('ktp')"
                        size="small"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent" location="bottom">Lihat dokumen</v-tooltip>
                      </v-btn>
                    </template>
                  </v-file-input>
                  <div v-if="hasDocument('ktp')" class="mt-1 ml-1">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="viewDocument('ktp')"
                      class="cursor-pointer"
                    >
                      <v-icon start size="small">mdi-file</v-icon>
                      Dokumen KTP
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="form.ktm"
                    label="Kartu Tanda Mahasiswa (KTM)"
                    prepend-icon="mdi-school"
                    :rules="fileRules"
                    accept=".pdf,.jpg,.jpeg,.png"
                    outlined
                    dense
                    :hint="uploadedFiles.ktm ? `Terakhir diunggah: ${uploadedFiles.ktm}` : 'Format: PDF/JPG/PNG (max 2MB)'"
                    persistent-hint
                    :loading="loading.ktm"
                    :disabled="loading.ktm"
                  >
                    <template #append>
                      <v-btn
                        v-if="hasDocument('ktm')"
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="viewDocument('ktm')"
                        size="small"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent" location="bottom">Lihat dokumen</v-tooltip>
                      </v-btn>
                    </template>
                  </v-file-input>
                  <div v-if="hasDocument('ktm')" class="mt-1 ml-1">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="viewDocument('ktm')"
                      class="cursor-pointer"
                    >
                      <v-icon start size="small">mdi-file</v-icon>
                      Dokumen KTM
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="form.transkrip"
                    label="Transkrip Nilai"
                    prepend-icon="mdi-file-chart"
                    :rules="[...fileRules, ...transkripRules]"
                    accept=".pdf"
                    outlined
                    dense
                    :hint="uploadedFiles.transkrip ? `Terakhir diunggah: ${uploadedFiles.transkrip}` : 'Format: PDF (max 2MB)'"
                    persistent-hint
                    :loading="loading.transkrip"
                    :disabled="loading.transkrip"
                  >
                    <template #append>
                      <v-btn
                        v-if="hasDocument('transkrip')"
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="viewDocument('transkrip')"
                        size="small"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent" location="bottom">Lihat dokumen</v-tooltip>
                      </v-btn>
                    </template>
                  </v-file-input>
                  <div v-if="hasDocument('transkrip')" class="mt-1 ml-1">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="viewDocument('transkrip')"
                      class="cursor-pointer"
                    >
                      <v-icon start size="small">mdi-file</v-icon>
                      Dokumen Transkrip
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="form.pernyataan"
                    label="Surat Pernyataan Tanggung Jawab"
                    prepend-icon="mdi-file-document"
                    :rules="[...fileRules, ...pernyataanRules]"
                    accept=".pdf"
                    outlined
                    dense
                    :hint="uploadedFiles.pernyataan ? `Terakhir diunggah: ${uploadedFiles.pernyataan}` : 'Format: PDF (max 2MB)'"
                    persistent-hint
                    :loading="loading.pernyataan"
                    :disabled="loading.pernyataan"
                  >
                    <template #append>
                      <v-btn
                        v-if="hasDocument('pernyataan')"
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="viewDocument('pernyataan')"
                        size="small"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent" location="bottom">Lihat dokumen</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="downloadTemplate('pernyataan')"
                        size="small"
                        :loading="downloading.pernyataan"
                      >
                        <v-icon>mdi-download</v-icon>
                        <v-tooltip activator="parent" location="bottom">Unduh template</v-tooltip>
                      </v-btn>
                    </template>
                  </v-file-input>
                  <div v-if="hasDocument('pernyataan')" class="mt-1 ml-1">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="viewDocument('pernyataan')"
                      class="cursor-pointer"
                    >
                      <v-icon start size="small">mdi-file</v-icon>
                      Dokumen Pernyataan
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="form.rekomendasi"
                    label="Surat Rekomendasi Dosen Pembimbing"
                    prepend-icon="mdi-account-tie"
                    :rules="[...fileRules, ...rekomendasiRules]"
                    accept=".pdf"
                    outlined
                    dense
                    :hint="uploadedFiles.rekomendasi ? `Terakhir diunggah: ${uploadedFiles.rekomendasi}` : 'Format: PDF (max 2MB)'"
                    persistent-hint
                    :loading="loading.rekomendasi"
                    :disabled="loading.rekomendasi"
                  >
                    <template #append>
                      <v-btn
                        v-if="hasDocument('rekomendasi')"
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="viewDocument('rekomendasi')"
                        size="small"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent" location="bottom">Lihat dokumen</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        color="primary"
                        @click.stop="downloadTemplate('rekomendasi')"
                        size="small"
                        :loading="downloading.rekomendasi"
                      >
                        <v-icon>mdi-download</v-icon>
                        <v-tooltip activator="parent" location="bottom">Unduh template</v-tooltip>
                      </v-btn>
                    </template>
                  </v-file-input>
                  <div v-if="hasDocument('rekomendasi')" class="mt-1 ml-1">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="viewDocument('rekomendasi')"
                      class="cursor-pointer"
                    >
                      <v-icon start size="small">mdi-file</v-icon>
                      Dokumen Rekomendasi
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider class="my-4"></v-divider>

            <v-card-actions class="px-6 py-4">
              <v-btn
                color="grey"
                variant="text"
                @click="resetForm"
                :disabled="submitting"
                class="text-none"
              >
                <v-icon left>mdi-close</v-icon>
                Batal
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                type="submit"
                :loading="submitting"
                :disabled="!isFormValid"
                depressed
                class="text-none"
              >
                <v-icon left>mdi-content-save</v-icon>
                Simpan Dokumen
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon color="success" size="large" class="mr-2">mdi-check-circle</v-icon>
          Berhasil!
        </v-card-title>
        <v-card-text>
          Dokumen administratif Anda telah berhasil disimpan dan akan segera diproses.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="successDialog = false"
            class="text-none"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useStudentDocument } from '@/composables/useStudentDocument'

definePageMeta({
  layout: 'profile',
  title: 'Dokumen Pendukung',
  middleware: 'auth'
})

const toast = useToast()
const formRef = ref()
const submitting = ref(false)
const successDialog = ref(false)

const { uploadDocument, getMyDocuments, documents, loading: apiLoading } = useStudentDocument()

// Loading states for individual file inputs
const loading = ref({
  ktp: false,
  ktm: false,
  transkrip: false,
  pernyataan: false,
  rekomendasi: false
})

const downloading = ref({
  pernyataan: false,
  rekomendasi: false
})

const uploadedFiles = ref<{
  ktp: string | null,
  ktm: string | null,
  transkrip: string | null,
  pernyataan: string | null,
  rekomendasi: string | null,
}>({
  ktp: null,
  ktm: null,
  transkrip: null,
  pernyataan: null,
  rekomendasi: null,
})

const form = ref({
  ktp: null,
  ktm: null,
  transkrip: null,
  pernyataan: null,
  rekomendasi: null,
})

// Rules
const fileRules = [
  (v: File | null) => !v || (v.size <= 2 * 1024 * 1024) || 'Ukuran maksimal 2MB',
  (v: File | null) => !v || /^[\w\-. ]+$/.test(v.name) || 'Nama file tidak valid (hindari karakter khusus)'
]

const transkripRules = [
  (v: File | null) => !v || v.name.toLowerCase().endsWith('.pdf') || 'Hanya format PDF yang diterima',
]

const pernyataanRules = [
  (v: File | null) => !v || v.name.toLowerCase().endsWith('.pdf') || 'Hanya format PDF yang diterima',
  (v: File | null) => !!v || 'Surat pernyataan wajib diunggah',
]

const rekomendasiRules = [
  (v: File | null) => !v || v.name.toLowerCase().endsWith('.pdf') || 'Hanya format PDF yang diterima',
]

const config = useRuntimeConfig()
const apiUrl = config.public.apiBase

const hasDocument = (type: string) => {
  return documents.value.some(doc => doc.Type === type)
}

const getDocumentPath = (type: string) => {
  const doc = documents.value.find(doc => doc.Type === type)
  return doc ? doc.Path : null
}

const isFormValid = computed(() => {
  return form.value.pernyataan !== null
})

const downloadTemplate = async (type: string) => {
  try {
    downloading.value[type as keyof typeof downloading.value] = true
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success(`Template ${type} berhasil diunduh`)
    // In a real app, you would fetch the template from the server
    // window.open(`/api/templates/${type}`, '_blank')
  } catch (error) {
    toast.error(`Gagal mengunduh template ${type}`)
  } finally {
    downloading.value[type as keyof typeof downloading.value] = false
  }
}

const viewDocument = (type: string) => {
  const path = getDocumentPath(type)
  if (path) {
    const fullUrl = `${apiUrl}${path}`
    window.open(fullUrl, '_blank')
    toast.info(`Membuka dokumen ${type}`)
  } else {
    toast.warning('Dokumen tidak ditemukan')
  }
}

const resetForm = () => {
  formRef.value.reset()
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    toast.error('Harap periksa kembali dokumen yang diunggah')
    return
  }

  submitting.value = true
  try {
    // Upload all filled documents
    const uploadPromises = []
    
    for (const [key, file] of Object.entries(form.value)) {
      if (file) {
        loading.value[key as keyof typeof loading.value] = true
        
        const fd = new FormData()
        fd.append('type', key)
        fd.append('document', file)
        
        uploadPromises.push(
          uploadDocument(fd)
            .then(() => {
              uploadedFiles.value[key as keyof typeof uploadedFiles.value] = formatDate(new Date().toISOString())
            })
            .finally(() => {
              loading.value[key as keyof typeof loading.value] = false
            })
        )
      }
    }

    await Promise.all(uploadPromises)
    await getMyDocuments() // Refresh the document list
    
    toast.success('Dokumen berhasil disimpan!')
    successDialog.value = true
    formRef.value.reset()
  } catch (error: any) {
    toast.error('Gagal menyimpan dokumen: ' + (error?.data?.error || error.message))
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Ambil dokumen user saat page dibuka
onMounted(async () => {
  try {
    await getMyDocuments()
    // Update uploaded files dates
    for (const doc of documents.value) {
      uploadedFiles.value[doc.type as keyof typeof uploadedFiles.value] = formatDate(doc.created_at)
    }
  } catch (error) {
    toast.error('Gagal memuat dokumen: ' + (error as Error).message)
  }
})
</script>

<style scoped>
.document-upload-container {
  max-width: 1200px;
}

.v-card {
  transition: box-shadow 0.2s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>