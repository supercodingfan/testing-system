import { Response } from '@common/typings'
import { WorkId, Work, CreateWork } from '@common/typings/work'
import { request } from '../request'

const getAll = async (): Promise<Response<Work[]>> => {
  const result = await request.get<Work[]>('work')
  return result
}

const getById = async (id: WorkId): Promise<Response<Work>> => {
  const result = await request.get<Work>(`work/${id}`)
  return result
}

const deleteById = async (id: WorkId): Promise<Response<Work>> => {
  const result = await request.delete<void, Work>(`work/${id}`)
  return result
}

const create = async (work: CreateWork): Promise<Response<void>> => {
  const result = await request.post<CreateWork, void>('work', work)
  return result
}

export const worksApi = {
  getAll,
  getById,
  deleteById,
  create,
}
