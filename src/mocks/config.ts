import { HttpResponse, type JsonBodyType } from 'msw'

export function unauthorized(message = 'Unauthorized') {
  return HttpResponse.json({ statusCode: 401, message, error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return HttpResponse.json({ statusCode: 403, message, error: 'Forbidden' }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return HttpResponse.json({ statusCode: 404, message, error: 'Not Found' }, { status: 404 })
}

export function badRequest(message: string | string[] = 'Bad request') {
  return HttpResponse.json({ statusCode: 400, message, error: 'Bad Request' }, { status: 400 })
}

export function ok<T extends JsonBodyType>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
}

export function okRaw<T extends JsonBodyType>(body: T, init?: ResponseInit) {
  return HttpResponse.json(body, init)
}
