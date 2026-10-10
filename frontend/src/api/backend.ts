import apiClient from './client'

export async function getBackendMessage(): Promise<string> {
  const response = await apiClient.get<string>('/test', {
    responseType: 'text',
  })

  return response.data
}
