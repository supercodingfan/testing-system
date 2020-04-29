import { createReEffect } from 'effector-reeffect'
import { tasksApi } from '../../../../../api'

export const getTaskFx = createReEffect({ handler: tasksApi.getById })
export const updateTaskFx = createReEffect({handler: tasksApi.update })
export const getTestsFx = createReEffect({ handler: tasksApi.getTestsById })