<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSurvey } from '../composables/useSurvey'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import { surveyApi } from '../utils/api'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()
const router = useRouter()
const { form, loading, submitting, error, submitResult, fetchSurvey, getVisibleRequiredIds, submitAnswers } = useSurvey()

const surveys = ref([])
const selectedSlug = ref(route.params.slug)
const answers = ref({})
const namaAnonim = ref('')
const revealedQuestions = ref(new Set())

// Load survey list
onMounted(async () => {
  try {
    const data = await surveyApi.listSurveys()
    surveys.value = data.response || []
  } catch (e) { /* ignore */ }
  loadSurvey(route.params.slug)
})

// Reload when route slug changes
watch(() => route.params.slug, (newSlug) => {
  loadSurvey(newSlug)
})

const loadSurvey = async (slug) => {
  selectedSlug.value = slug
  answers.value = {}
  namaAnonim.value = ''
  submitResult.value = null
  revealedQuestions.value = new Set()
  await fetchSurvey(slug)
  if (form.value?.questions) {
    form.value.questions.forEach(q => {
      if (q.type === 'checkbox') answers.value[q.id] = []
      if (!q.parent_question_id) revealedQuestions.value.add(q.id)
    })
  }
}

const updateConditionalVisibility = (questionId, value) => {
  answers.value[questionId] = value
  if (form.value?.questions) {
    form.value.questions.forEach(q => {
      if (q.parent_question_id === questionId) {
        if (String(value) === q.trigger_value) {
          revealedQuestions.value.add(q.id)
          if (q.type === 'checkbox') answers.value[q.id] = []
        } else {
          revealedQuestions.value.delete(q.id)
          delete answers.value[q.id]
        }
      }
    })
  }
}

const visibleQuestions = computed(() => {
  if (!form.value?.questions) return []
  return form.value.questions.filter(q => revealedQuestions.value.has(q.id))
})

const allRequiredAnswered = computed(() => {
  const requiredIds = getVisibleRequiredIds(answers.value)
  return requiredIds.every(id => {
    const val = answers.value[id]
    return val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)
  })
})

const answeredCount = computed(() => {
  return visibleQuestions.value.filter(q => {
    const val = answers.value[q.id]
    return val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)
  }).length
})

const handleSubmit = async () => {
  const success = await submitAnswers(answers.value, namaAnonim.value || null)
  if (!success && error.value) { toast.add({ severity: 'error', summary: 'Gagal', detail: typeof error.value === 'object' ? 'Pertanyaan wajib belum dijawab' : error.value, life: 5000 }) }
  if (success) {
    toast.add({ severity: 'success', summary: 'Berhasil!', detail: 'Survey telah dikirim. Terima kasih.', life: 4000 })
    answers.value = {}
    namaAnonim.value = ''
    revealedQuestions.value = new Set()
    if (form.value?.questions) {
      form.value.questions.forEach(q => {
        if (q.type === 'checkbox') answers.value[q.id] = []
        if (!q.parent_question_id) revealedQuestions.value.add(q.id)
      })
    }
  }
}

const switchSurvey = (slug) => {
  router.push(`/survey/${slug}`)
}
</script>

<template>
  <div class="survey-page">
    <Toast position="top-right" />
    <div class="page-header">
      <div class="page-header-icon" style="background: var(--primary-50)">
        <i class="pi pi-clipboard" style="color: var(--primary-color)"></i>
      </div>
      <div style="flex:1">
        <h1 class="page-title">{{ form?.title || 'Survey' }}</h1>
        <p class="page-subtitle">{{ form?.description || 'Berikan masukan Anda' }}</p>
      </div>
    </div>

    <!-- Survey Picker -->
    <div v-if="surveys.length > 1" style="margin-bottom:1rem">
      <Select
        v-model="selectedSlug"
        :options="surveys"
        optionLabel="title"
        optionValue="slug"
        placeholder="Pilih survey lain..."
        style="width:100%"
        @change="(e) => switchSurvey(e.value)"
      />
    </div>

    <div v-if="loading" style="padding: 2rem 0">
      <ProgressBar mode="indeterminate" style="height: 6px; border-radius: 3px" />
      <p style="text-align:center;margin-top:1rem;color:var(--text-color-secondary)">Memuat survey...</p>
    </div>

    <Message v-else-if="error && !form" severity="error" style="margin-bottom:1rem;border-radius:0.75rem">
      {{ error }}
    </Message>



    <div v-if="form?.questions" class="survey-form">
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-user"></i>
          <span>Nama Anda</span>
          <span class="header-hint">(opsional)</span>
        </div>
        <div class="form-fields-single">
          <div class="input-with-icon">
            <i class="pi pi-user"></i>
            <InputText v-model="namaAnonim" placeholder="Tulis nama Anda (opsional)" style="width:100%" />
          </div>
        </div>
      </div>

      <div v-for="q in visibleQuestions" :key="q.id" class="form-card question-card">
        <div class="form-card-header">
          <span>{{ q.order }}. {{ q.question_text }}</span>
          <span v-if="q.is_required" class="required-star">*</span>
          <span v-if="q.parent_question_id" class="conditional-badge">
            <i class="pi pi-link" style="font-size:0.65rem"></i> Kondisional
          </span>
        </div>
        <div class="form-fields-single">

          <div v-if="q.type === 'radio'">
            <div v-for="opt in q.options" :key="opt" class="option-row">
              <RadioButton v-model="answers[q.id]" :inputId="`q${q.id}_${opt}`" :name="`q${q.id}`" :value="opt" @change="updateConditionalVisibility(q.id, opt)" />
              <label :for="`q${q.id}_${opt}`" class="option-label">{{ opt }}</label>
            </div>
          </div>

          <div v-if="q.type === 'checkbox'">
            <div v-for="opt in q.options" :key="opt" class="option-row">
              <Checkbox v-model="answers[q.id]" :inputId="`q${q.id}_${opt}`" :value="opt" />
              <label :for="`q${q.id}_${opt}`" class="option-label">{{ opt }}</label>
            </div>
          </div>

          <Rating v-if="q.type === 'rating'" v-model="answers[q.id]" :stars="5" @change="(e) => updateConditionalVisibility(q.id, e.value)" />

          <Textarea v-if="q.type === 'textarea'" v-model="answers[q.id]" :rows="3" placeholder="Tulis jawaban Anda..." style="width:100%" />

          <InputText v-if="q.type === 'text' || !q.type" v-model="answers[q.id]" placeholder="Tulis jawaban Anda..." style="width:100%" />

        </div>
      </div>

      <div class="form-actions">
        <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined rounded @click="answers = {}; namaAnonim = ''; submitResult = null" />
        <Button label="Kirim Survey" icon="pi pi-send" severity="success" rounded :loading="submitting" :disabled="!allRequiredAnswered" @click="handleSubmit" />
      </div>
    </div>

    <div v-if="form?.questions" class="progress-info">
      <small>{{ answeredCount }} dari {{ visibleQuestions.length }} pertanyaan dijawab</small>
    </div>
  </div>
</template>

<style scoped>
.survey-page { max-width: 700px; margin: 0 auto; padding: 0 1rem 3rem; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.page-header-icon { width: 3rem; height: 3rem; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-header-icon i { font-size: 1.25rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0; line-height: 1.3; color: var(--text-color); }
.page-subtitle { font-size: 0.8rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; }
.survey-form { display: flex; flex-direction: column; gap: 0.75rem; }
.form-card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; overflow: hidden; }
.question-card { animation: slideIn 0.3s ease; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.form-card-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.25rem; background: var(--surface-ground); border-bottom: 1px solid var(--surface-border); font-weight: 700; font-size: 0.85rem; flex-wrap: wrap; }
.form-card-header i { font-size: 0.9rem; color: var(--primary-color); }
.required-star { color: var(--red-500); font-weight: 700; margin-left: 0.25rem; }
.conditional-badge { font-size: 0.7rem; color: var(--text-color-secondary); margin-left: auto; background: var(--surface-hover); padding: 0.15rem 0.5rem; border-radius: 1rem; }
.header-hint { font-weight: 400; font-size: 0.75rem; margin-left: 0.5rem; color: var(--text-color-secondary); }
.form-fields-single { padding: 1.25rem; }
.option-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; }
.option-label { cursor: pointer; font-size: 0.9rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.input-with-icon { display: flex; align-items: center; gap: 0.6rem; background: var(--surface-ground); border: 1px solid var(--surface-border); border-radius: 0.75rem; padding: 0 0.85rem; }
.input-with-icon i { color: var(--text-color-secondary); font-size: 0.9rem; }
.progress-info { text-align: center; margin-top: 1rem; color: var(--text-color-secondary); }
</style>
