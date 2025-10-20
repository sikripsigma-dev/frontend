<template>
  <div class="validation-container">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-title">
          <v-icon color="primary" class="mr-2">mdi-clipboard-check</v-icon>
          <h1 class="text-h5">Validasi Studi Kasus</h1>
        </div>
        <v-text-field
          v-model="search"
          density="compact"
          variant="outlined"
          placeholder="Cari studi kasus..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
        />
      </div>

      <!-- Case Feed -->
      <div class="case-feed">
        <v-card
          v-for="caseItem in filteredCases"
          :key="caseItem.id"
          class="case-card"
          elevation="0"
          border
        >
          <!-- Case Header -->
          <div class="case-header">
            <v-avatar size="40" class="mr-3">
              <v-img :src="logoUrl(caseItem.company?.Logo)" />
            </v-avatar>
            <div class="case-info">
              <div class="company-name">{{ caseItem.company?.Name }}</div>
              <div class="case-date">{{ formatDate(caseItem.created_at) }}</div>
            </div>

            <!-- Aksi hanya saat pending -->
            <v-btn icon variant="text" size="small" v-if="isPending(caseItem)">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-icon v-bind="props">mdi-dots-horizontal</v-icon>
                </template>
                <v-list density="compact">
                  <v-list-item @click="toggleStatus(caseItem, 'approved')">
                    <v-icon color="green" class="mr-2">mdi-check</v-icon>
                    <v-list-item-title>Setujui</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="toggleStatus(caseItem, 'rejected')">
                    <v-icon color="red" class="mr-2">mdi-close</v-icon>
                    <v-list-item-title>Tolak</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>

          <!-- Case Content -->
          <div class="case-content">
            <h2 class="case-title">{{ caseItem.title }}</h2>

            <!-- Kategori -->
            <div class="case-meta" v-if="caseItem.categories?.length">
              <v-chip
                v-for="cat in caseItem.categories"
                :key="cat.id"
                size="small"
                class="mr-2"
              >
                {{ cat.name }}
              </v-chip>
            </div>

            <!-- Meta lain -->
            <div class="case-meta">
              <v-chip size="small" class="mr-2">{{ caseItem.field }}</v-chip>
              <v-chip size="small" class="mr-2">{{ caseItem.duration }}</v-chip>
              <v-chip size="small">{{ caseItem.location }}</v-chip>
            </div>

            <p class="case-description">
              {{ caseItem.description }}
            </p>

            <!-- Status and Actions -->
            <div class="case-footer">
              <v-chip :color="getStatusColor(caseItem.review_status)" size="small" variant="outlined">
                {{ getStatusText(caseItem.review_status) }}
              </v-chip>
              <v-spacer />
              <v-btn variant="text" color="primary" @click="openComments(caseItem)" class="comment-btn">
                <v-icon size="small" class="mr-1">mdi-comment-outline</v-icon>
                {{ commentCounts[caseItem.id] ?? 0 }}
              </v-btn>
            </div>
          </div>
        </v-card>

        <v-alert v-if="filteredCases.length === 0" type="info" variant="tonal" class="empty-state">
          Tidak ada studi kasus yang perlu divalidasi
        </v-alert>
      </div>
    </div>

    <!-- Comment Sidebar -->
    <div v-if="selectedCase" class="comment-sidebar">
      <div class="sidebar-content">
        <!-- Comment Header -->
        <div class="sidebar-header">
          <v-btn icon @click="closeComments" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2 class="sidebar-title">Komentar</h2>
        </div>

        <!-- Case Preview -->
        <div class="case-preview">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img :src="logoUrl(selectedCase.company?.Logo)" />
            </v-avatar>
            <div>
              <div class="company-name">{{ selectedCase.company?.Name }}</div>
              <p class="case-title">{{ selectedCase.title }}</p>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="loadingComments" class="no-comments">
            <v-progress-circular indeterminate />
          </div>

          <div
            v-for="(c, idx) in comments"
            :key="c.id || idx"
            class="comment-item"
          >
            <v-avatar size="36" class="mr-3">
              <v-img :src="avatarUrl(c.ProgramHead?.Image)" />
            </v-avatar>
            <div>
              <div class="comment-author">{{ c.ProgramHead?.Name || 'Kaprodi' }}</div>
              <div class="comment-text">{{ c.text }}</div>
              <div class="comment-date">{{ formatCommentDate(c.created_at) }}</div>
            </div>
          </div>

          <div v-if="!loadingComments && comments.length === 0" class="no-comments">
            <v-icon size="64" color="grey-lighten-2">mdi-comment-off</v-icon>
            <p>Belum ada komentar</p>
          </div>
        </div>

        <!-- Comment Input -->
        <div class="comment-input">
          <v-textarea
            v-model="commentText"
            variant="outlined"
            placeholder="Tulis komentar..."
            rows="1"
            auto-grow
            hide-details
            class="comment-textarea"
          />
          <v-btn icon color="primary" @click="submitComment" :disabled="!commentText" class="send-btn">
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useToast } from 'vue-toastification'
import { useResearchCaseValidation } from '@/composables/useResearchCaseValidation'

definePageMeta({ layout: 'profile' })

const toast = useToast()
const config = useRuntimeConfig()
const { getResearchCase, getComments, addComment, setValidationStatus } = useResearchCaseValidation()

const cases = ref<any[]>([])
const selectedCase = ref<any | null>(null)
const comments = ref<any[]>([])
const commentCounts = reactive<Record<string, number>>({})
const loadingComments = ref(false)
const commentText = ref('')
const search = ref('')

onMounted(async () => {
  const { data, error } = await getResearchCase()
  if (!error.value && data.value) {
    cases.value = (data.value as any).research_cases || []
    // (opsional) inisialisasi badge komentar jika BE sudah mengirim count
    for (const c of cases.value) {
      if (typeof c.research_case_validation_comments_count === 'number') {
        commentCounts[c.id] = c.research_case_validation_comments_count
      }
    }
  } else {
    console.error('Failed to fetch research cases:', error.value)
  }
})

const filteredCases = computed(() =>
  cases.value.filter((c: any) =>
    c.title?.toLowerCase()?.includes(search.value.toLowerCase())
  )
)

const isPending = (c: any) => !c.review_status || c.review_status === 'pending'

function logoUrl(path?: string) {
  if (!path) return '/default-company.png'
  return path.startsWith('http') ? path : `${config.public.apiBase}${path}`
}
function avatarUrl(path?: string) {
  if (!path) return '/default-avatar.png'
  return path.startsWith('http') ? path : `${config.public.apiBase}${path}`
}

function formatDate(s: string) {
  const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return new Date(s).toLocaleDateString('id-ID', opt)
}

function formatCommentDate(s: string) {
  const d = new Date(s); const now = new Date()
  const diffDays = Math.floor((+now - +d) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  return formatDate(s)
}

function getStatusColor(status?: string) {
  return (status === 'approved' && 'green') || (status === 'rejected' && 'red') || 'orange'
}
function getStatusText(status?: string) {
  return (status === 'approved' && 'Disetujui') || (status === 'rejected' && 'Ditolak') || 'Menunggu'
}

async function toggleStatus(caseItem: any, status: 'approved' | 'rejected') {
  try {
    await setValidationStatus(caseItem.id, status)
    caseItem.review_status = status
    toast.success('Status diperbarui')
  } catch (e: any) {
    console.error(e)
    toast.error(e?.data?.error || 'Gagal memperbarui status')
  }
}

async function openComments(caseItem: any) {
  selectedCase.value = caseItem
  commentText.value = ''
  loadingComments.value = true
  comments.value = []
  try {
    const { data, error } = await getComments(caseItem.id)
    if (error.value) throw error.value

    // Normalisasi field (BE bisa kirim PascalCase)
    const raw = ((data.value as any)?.comments || []) as any[]
    comments.value = raw.map((c: any) => ({
      id: c.ID || c.id,
      text: c.Comment || c.comment,
      created_at: c.CreatedAt || c.created_at,
      ProgramHead: {
        Name: c.ProgramHead?.Name || c.user?.name,
        Image: c.ProgramHead?.Image || c.user?.image,
      },
    }))

    commentCounts[caseItem.id] = comments.value.length
  } catch (e) {
    toast.error('Gagal memuat komentar')
  } finally {
    loadingComments.value = false
  }
}

function closeComments() {
  selectedCase.value = null
  comments.value = []
}

async function submitComment() {
  if (!selectedCase.value || !commentText.value) return
  try {
    const res: any = await addComment(selectedCase.value.id, commentText.value)
    const c = res?.comment || {}
    const normalized = {
      id: c.ID || c.id || Date.now().toString(),
      text: c.Comment || c.comment || commentText.value,
      created_at: c.CreatedAt || c.created_at || new Date().toISOString(),
      ProgramHead: {
        Name: c.ProgramHead?.Name || 'Anda',
        Image: c.ProgramHead?.Image || '',
      },
    }
    comments.value.unshift(normalized)
    commentCounts[selectedCase.value.id] = (commentCounts[selectedCase.value.id] || 0) + 1
    commentText.value = ''
  } catch (e: any) {
    console.error(e)
    toast.error(e?.data?.error || 'Gagal menambahkan komentar')
  }
}
</script>

<style scoped>
.validation-container{display:flex;height:100%;position:relative}
.main-content{flex:1;padding:16px;max-width:800px;margin:0 auto}
.header-section{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding:8px 0}
.header-title{display:flex;align-items:center}
.search-field{max-width:300px;margin-left:16px}
.case-feed{display:flex;flex-direction:column;gap:16px}
.case-card{padding:16px;border-radius:8px}
.case-header{display:flex;align-items:center;margin-bottom:12px}
.case-info{flex:1}
.company-name{font-weight:600}
.case-date{font-size:.75rem;color:rgba(0,0,0,.6)}
.case-content{margin-bottom:12px}
.case-title{font-size:1.125rem;font-weight:600;margin-bottom:8px}
.case-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.case-description{font-size:.875rem;color:rgba(0,0,0,.8);margin-bottom:12px}
.case-footer{display:flex;align-items:center}
.comment-btn{font-size:.875rem}
.empty-state{margin-top:24px}
.comment-sidebar{width:400px;height:100vh;position:sticky;top:0;right:0;border-left:1px solid rgba(0,0,0,.12);background:#fff;display:flex;flex-direction:column}
.sidebar-content{display:flex;flex-direction:column;height:100%}
.sidebar-header{display:flex;align-items:center;padding:16px;border-bottom:1px solid rgba(0,0,0,.12)}
.sidebar-title{font-size:1.125rem;font-weight:600}
.case-preview{padding:16px;border-bottom:1px solid rgba(0,0,0,.12)}
.comments-list{flex:1;overflow-y:auto;padding:16px}
.comment-item{display:flex;margin-bottom:16px}
.comment-author{font-weight:600;font-size:.875rem}
.comment-text{font-size:.875rem;margin:4px 0}
.comment-date{font-size:.75rem;color:rgba(0,0,0,.6)}
.no-comments{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(0,0,0,.6)}
.comment-input{display:flex;align-items:center;padding:16px;border-top:1px solid rgba(0,0,0,.12);background:#fff}
.comment-textarea{flex:1;margin-right:8px}
.send-btn{align-self:flex-end;margin-bottom:8px}
@media (max-width:960px){.comment-sidebar{position:fixed;top:0;right:0;width:100%;height:100%;z-index:1000;box-shadow:-2px 0 8px rgba(0,0,0,.1)}}
</style>
