import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { CourseRun, CourseRunDraft } from '../types/course'

// ─────────────────────────────────────────────────────────────────────────────
// /cms/courses/:courseId/runs — đa run / cohort của 1 khoá. Response snake_case
// (CourseRunCmsResponse), FE dùng thẳng. MSW intercept ở dev.
// ─────────────────────────────────────────────────────────────────────────────

export function useCourseRuns(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-runs', courseId],
    queryFn: () => api.getRaw<{ data: CourseRun[] }>(`/cms/courses/${courseId}/runs`).then((r) => r.data),
    enabled: !!courseId,
  })
}

export function useCreateRun(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: Partial<CourseRunDraft>) =>
      api.post<CourseRun>(`/cms/courses/${courseId}/runs`, draft),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-runs', courseId] }),
  })
}

export function useUpdateRun(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, patch }: { runId: string; patch: Partial<CourseRunDraft> }) =>
      api.patch<CourseRun>(`/cms/courses/${courseId}/runs/${runId}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-runs', courseId] }),
  })
}

export function useDeleteRun(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (runId: string) => api.delete(`/cms/courses/${courseId}/runs/${runId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-runs', courseId] }),
  })
}
