import { Elysia, t } from 'elysia'
import { db } from '../db'
import { ok, fail, verifyToken, getTokenHashFromHeader } from '../middleware/auth'

export const surveyRoutes = new Elysia({ prefix: '/v1/portal' })

  .get('/survey', async () => {
    const forms = await db.query<any>(
      'SELECT id, title, slug, description, is_active, created_at FROM uxui_portal_forms WHERE is_active = 1 ORDER BY created_at DESC'
    )
    return ok(forms)
  })

  .get('/survey/:slug', async ({ params, set }) => {
    const form = await db.first<any>(
      'SELECT id, title, slug, description, is_active FROM uxui_portal_forms WHERE slug = ? AND is_active = 1',
      [params.slug]
    )
    if (!form) {
      set.status = 404
      return fail('Survey tidak ditemukan', 404)
    }

    const questions = await db.query<any>(
      `SELECT id, form_id, question_text, type, options, is_required, \`order\`, parent_question_id, trigger_value
       FROM uxui_portal_form_questions
       WHERE form_id = ?
       ORDER BY \`order\`, id`,
      [form.id]
    )

    const parsed = questions.map((q: any) => ({
      id: q.id,
      form_id: q.form_id,
      question_text: q.question_text,
      type: q.type,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
      is_required: !!q.is_required,
      order: q.order,
      parent_question_id: q.parent_question_id,
      trigger_value: q.trigger_value,
    }))

    return ok({ ...form, questions: parsed })
  })

  .post(
    '/survey/:slug/submit',
    async ({ params, body, headers, set }) => {
      const form = await db.first<any>(
        'SELECT id FROM uxui_portal_forms WHERE slug = ? AND is_active = 1',
        [params.slug]
      )
      if (!form) {
        set.status = 404
        return fail('Survey tidak ditemukan', 404)
      }

      // Try to get user from token
      let noRkmMedis = null
      let nip = null
      const userId = await verifyToken(headers.authorization)
      if (userId) {
        const user = await db.first<any>(
          'SELECT no_rkm_medis FROM uxui_portal_users WHERE id = ?',
          [userId]
        )
        if (user) noRkmMedis = user.no_rkm_medis
      }

      // Insert response
      const result = await db.execute(
        'INSERT INTO uxui_portal_form_responses (form_id, nip, no_rkm_medis, nama_anonim, submitted_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())',
        [form.id, nip, noRkmMedis, body.nama_anonim || null]
      )
      const responseId = result.insertId

      // Insert answers
      for (const a of body.answers) {
        try {
          await db.execute(
            'INSERT INTO uxui_portal_form_answers (form_response_id, form_question_id, answer, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [responseId, a.form_question_id, Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer)]
          )
        } catch {
          // Skip answers referencing non-existent questions (FK constraint)
          continue
        }
      }

      return ok({ response_id: responseId }, 'Survey berhasil dikirim')
    },
    {
      body: t.Object({
        nama_anonim: t.Optional(t.String()),
        answers: t.Array(
          t.Object({
            form_question_id: t.Number(),
            answer: t.Union([t.String(), t.Array(t.String())]),
          })
        ),
      }),
    }
  )
