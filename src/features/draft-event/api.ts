import createClient from 'openapi-fetch'
import { BASE_URL } from '/@/lib/api/baseUrl'
import type {
  RequestAvailability,
  RequestCandidateSlot,
  RequestDraftEvent,
  ResponseAvailability,
  ResponseDraftEvent,
  ResponseDraftEventDetail,
  ResponseSchedulingResults
} from '/@/features/draft-event/types'

type JsonResponse<T> = { content: { 'application/json': T } }
type JsonBody<T> = { content: { 'application/json': T } }
type ErrorResponses = { default: JsonResponse<{ message: string }> }
type DraftParameter = { path: { id: string } }
type UserParameter = { path: { userId: string } }
type AvailabilityParameter = { path: { id: string; userId: string } }

// This local contract is provisional until draft-event enters the generated schema.
export interface DraftPaths {
  '/draft-events': {
    get: {
      responses: { 200: JsonResponse<ResponseDraftEvent[]> } & ErrorResponses
    }
    post: {
      requestBody: JsonBody<RequestDraftEvent>
      responses: {
        201: JsonResponse<ResponseDraftEventDetail>
      } & ErrorResponses
    }
  }
  '/draft-events/{id}': {
    get: {
      parameters: DraftParameter
      responses: {
        200: JsonResponse<ResponseDraftEventDetail>
      } & ErrorResponses
    }
    delete: {
      parameters: DraftParameter
      responses: { 204: { content?: never } } & ErrorResponses
    }
  }
  '/draft-events/{id}/confirm': {
    post: {
      parameters: DraftParameter
      requestBody: JsonBody<RequestCandidateSlot>
      responses: {
        200: JsonResponse<ResponseDraftEventDetail>
      } & ErrorResponses
    }
  }
  '/draft-events/{id}/availabilities': {
    get: {
      parameters: DraftParameter
      responses: { 200: JsonResponse<ResponseAvailability[]> } & ErrorResponses
    }
  }
  '/draft-events/{id}/availabilities/{userId}': {
    get: {
      parameters: AvailabilityParameter
      responses: {
        200: JsonResponse<ResponseAvailability | null>
      } & ErrorResponses
    }
    put: {
      parameters: AvailabilityParameter
      requestBody: JsonBody<RequestAvailability>
      responses: { 200: JsonResponse<ResponseAvailability> } & ErrorResponses
    }
  }
  '/users/{userId}/draft-availabilities': {
    get: {
      parameters: UserParameter
      responses: { 200: JsonResponse<ResponseAvailability[]> } & ErrorResponses
    }
  }
  '/draft-events/{id}/scheduling-results': {
    get: {
      parameters: DraftParameter
      responses: {
        200: JsonResponse<ResponseSchedulingResults>
      } & ErrorResponses
    }
  }
}

export const draftApiClient = createClient<DraftPaths>({
  baseUrl: BASE_URL,
  credentials: 'include'
})
