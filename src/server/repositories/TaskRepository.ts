import { db } from '@db'
import {
  Task,
  CreateTask,
  UpdateTask,
  TaskId,
  Topic,
  TaskPreview,
  TaskWithoutDescription,
} from '@common/typings/task'

export class TaskRepository {
  static async getById(id: TaskId): Promise<Task> {
    const [task] = await db.query(
      `
      SELECT
        T.id, T.name, T.description, jsonb_build_object('id', Topic.id, 'name', Topic.name) as topic
      FROM Task T, TaskTopic Topic
      WHERE (T.id = %L and  T.topic_id = Topic.id)
      `,
      id,
    )

    return task
  }

  //TODO fix function return type
  static async getTestsById(
    id: TaskId,
  ): Promise<Array<{ id: number; input: string; output: string }>> {
    const tests = await db.query(
      `
      SELECT
        T.id, T.input, T.output
      FROM Test T
      WHERE (T.task_id = %L)
      ORDER BY T.id 
      `,
      id,
    )
    return tests
  }

  static async getTopics(): Promise<Topic[]> {
    const topics = await db.query(`
      SELECT
        T.id, T.name
      FROM TaskTopic T
      ORDER BY T.name
    `)

    return topics
  }

  static async getPreviewById(id: TaskId): Promise<TaskPreview> {
    const [preview] = await db.query(
      `
      SELECT
        T.id, T.name, T.description, Topic.name as topic,
        (
          SELECT jsonb_build_object('input', input, 'output', output)
          FROM Test
          WHERE Test.task_id = T.id
          ORDER BY id LIMIT 1
        ) as test
      FROM Task T, TaskTopic Topic, Test
      WHERE (T.id = %L and  T.topic_id = Topic.id and Test.task_id = T.id)
    `,
      id,
    )

    return preview
  }

  static async getAll(): Promise<Task[]> {
    const tasks = await db.query(`
      SELECT
        T.id, T.name, T.description, jsonb_build_object('id', Topic.id, 'name', Topic.name) as topic
      FROM Task T, TaskTopic Topic
      WHERE (T.topic_id = Topic.id)
      ORDER BY Topic.name
    `)

    return tasks
  }

  static async getAllWithoutDescription(): Promise<TaskWithoutDescription[]> {
    const tasks = await db.query(`
      SELECT
        T.id, T.name, jsonb_build_object('id', Topic.id, 'name', Topic.name) as topic
      FROM Task T, TaskTopic Topic
      WHERE (T.topic_id = Topic.id)
      ORDER BY Topic.name
    `)

    return tasks
  }

  static async create(t: CreateTask): Promise<Task> {
    const [task] = await db.query(
      `
        INSERT INTO Task as T
          (name, description, topic_id)
        VALUES (%L)
        RETURNING
          T.id, T.name, T.description,
          jsonb_build_object(
            'id', topic_id, 'name', 
            (SELECT Topic.name FROM TaskTopic Topic WHERE Topic.id = topic_id)
          ) as topic
      `,
      [t.name, t.description, t.topicId],
    )

    const tests = t.tests.map((test) => [task.id, ...Object.values(test)])
    await db.query(`INSERT INTO Test as T (task_id, input, output) VALUES %L`, tests)

    return task
  }

  static async update(t: UpdateTask): Promise<Task> {
    const updateTaskQuery = db.createQueryString(
      `
        UPDATE Task T
        SET
          name = %L,
          description = %L,
          topic_id = %L
        WHERE (T.id = %L)
        RETURNING
          T.id, T.name, T.description,
          jsonb_build_object(
            'id', topic_id, 'name', 
            (SELECT Topic.name FROM TaskTopic Topic WHERE Topic.id = topic_id)
          ) as topic
      `,
      t.name,
      t.description,
      t.topicId,
      t.id,
    )

    const [task] = await db.query(updateTaskQuery)

    if (t.editTests) {
      const forUpdate = t.testsForUpdate.map(({ id, input, output }) =>
        Object.values({ id, input, output }),
      )

      const forInsert = t.testsForInsert.map(({ input, output }) =>
        Object.values({ id: t.id, input, output }),
      )

      const forDelete = t.testsForDelete
      const updateTestsQuery = db.createQueryString(
        `
       UPDATE Test T
        SET
          input = kek.input,
          output = kek.output
        FROM
          (VALUES %L) as kek(id, input, output)
        WHERE T.id = CAST (kek.id as INT)`,
        forUpdate,
      )

      const insertTestsQuery = db.createQueryString(
        `INSERT INTO Test (task_id, input, output) VALUES %L`,
        forInsert,
      )

      const deleteTestsQuery = db.createQueryString(
        `
        DELETE FROM Test as T
        WHERE (T.id in (%L))
        `,
        forDelete,
      )

      const queries = []

      if (forInsert.length) {
        queries.push(insertTestsQuery)
      }
      if (forUpdate.length) {
        queries.push(updateTestsQuery)
      }
      if (forDelete.length) {
        queries.push(deleteTestsQuery)
      }

      await Promise.all(queries.map((q) => db.query(q)))
    }

    return task
  }

  static async removeById(id: TaskId): Promise<Task> {
    const [task] = await db.query(
      `
        DELETE FROM Task as T
        WHERE (T.id = %L)
        RETURNING
          T.id, T.name, T.description,
          jsonb_build_object(
            'id', topic_id, 'name', 
            (SELECT Topic.name FROM TaskTopic Topic WHERE Topic.id = topic_id)
          ) as topic
      `,
      id,
    )
    return task
  }
}
