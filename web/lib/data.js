import { sql } from '@vercel/postgres';

export async function fetchThreads(type, user_id) {
  const data = await sql`
    SELECT *
    FROM (
      SELECT DISTINCT ON (t.thread_id) t.thread_id, t.source, t.title, e.timestamp, e.author, et.content
      FROM threads t
      INNER JOIN entries e USING (thread_id)
      INNER JOIN entry_access a USING (entry_id)
      LEFT JOIN entry_text et USING (entry_id)
      WHERE t.type = ${type}
      AND a.identity = ${user_id}
      ORDER BY t.thread_id, e.timestamp DESC
    )
    ORDER BY timestamp DESC
  `;

  return data.rows;
}


export async function fetchEntries(thread_id, user_id) {
  const data = await sql`
    SELECT e.entry_id, e.timestamp, e.author, et.content
    FROM entries e
    INNER JOIN entry_access a USING (entry_id)
    INNER JOIN entry_text et USING (entry_id)
    WHERE e.thread_id = ${thread_id}
    AND a.identity = ${user_id}
    ORDER BY e.timestamp
    LIMIT 100
  `;

  return data.rows;
}
