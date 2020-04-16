import React from 'react'
import { useStore } from 'effector-react'
import * as T from '../../../components/Table'
import {
  PrimaryButton as Add,
  EditButton as Edit,
  DeleteButton as Delete,
} from '../../../components/Buttons'
import { tasksTable } from '../model'
import styles from './TasksTable.module.css'

export const TasksTable = () => {
  const tasks = useStore(tasksTable.$tasks)

  return (
    <T.Table className={styles.table}>
      <T.Head className={styles.head}>
        <T.Row>
          <T.Cell colSpan={6}>
            <T.Header>
              <T.Title>Задания</T.Title>
              <T.Actions>
                <Add onClick={() => {}}>Добавить</Add>
              </T.Actions>
            </T.Header>
          </T.Cell>
        </T.Row>
        <T.Row>
          <T.Cell>id</T.Cell>
          <T.Cell>Описание</T.Cell>
          <T.Cell>Пример входных данных</T.Cell>
          <T.Cell>Пример выходных данных</T.Cell>
          <T.Cell>Действия</T.Cell>
        </T.Row>
      </T.Head>
      <T.Body>
        {tasks.map((task) => (
          <T.Row key={task.id}>
            <T.Cell>{task.id}</T.Cell>
            <T.Cell>{task.description}</T.Cell>
            <T.Cell>{task.exampleInput}</T.Cell>
            <T.Cell>{task.exampleOutput}</T.Cell>
            <T.Cell>
              <div className={styles.rowActions}>
                <Edit onClick={() => {}} />
                <Delete onClick={() => tasksTable.deleteTask(task.id)} />
              </div>
            </T.Cell>
          </T.Row>
        ))}
      </T.Body>
    </T.Table>
  )
}