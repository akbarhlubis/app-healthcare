import { ref } from 'vue'
import { surveyApi } from '../utils/api'

export function useSurvey() {
  const form = ref(null)           // { id, title, description, slug, questions[] }
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref(null)
  const submitResult = ref(null)

  /**
   * Fetch survey by slug
   */
  const fetchSurvey = async (slug) => {
    loading.value = true
    error.value = null
    try {
      const data = await surveyApi.getSurvey(slug)
      form.value = data.response
    } catch (e) {
      form.value = null
      error.value = e.message || 'Gagal memuat survey'
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a conditional question should be visible
   * based on its parent's answer.
   */
  const isQuestionVisible = (question, answers) => {
    if (!question.parent_question_id) return true
    const parentAnswer = answers[question.parent_question_id]
    if (!parentAnswer) return false
    return parentAnswer === question.trigger_value
  }

  /**
   * Get all required question IDs that are currently visible.
   */
  const getVisibleRequiredIds = (answers) => {
    if (!form.value?.questions) return []
    return form.value.questions
      .filter(q => q.is_required && isQuestionVisible(q, answers))
      .map(q => q.id)
  }

  /**
   * Submit answers to the API
   * @param {Object} answers - { questionId: answerValue }
   * @param {string} namaAnonim - optional, for anonymous users
   */
  const submitAnswers = async (answers, namaAnonim = null) => {
    submitting.value = true
    error.value = null
    submitResult.value = null

    try {
      const answersArray = Object.entries(answers)
        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
        .map(([questionId, value]) => ({
          form_question_id: parseInt(questionId),
          answer: Array.isArray(value) ? value.join(', ') : String(value),
        }))

      const payload = { answers: answersArray }
      if (namaAnonim) {
        payload.nama_anonim = namaAnonim
      }

      const data = await surveyApi.submitSurvey(form.value.slug, payload)
      submitResult.value = { success: true, responseId: data.response?.response_id }
      return true
    } catch (e) {
      // Parse missing required questions from server response
      try {
        const parsed = JSON.parse(e.message)
        error.value = parsed
      } catch {
        error.value = e.message || 'Gagal mengirim survey'
      }
      console.error('submitAnswers error:', e)
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    loading,
    submitting,
    error,
    submitResult,
    fetchSurvey,
    isQuestionVisible,
    getVisibleRequiredIds,
    submitAnswers,
  }
}
