import { sql } from '@vercel/postgres';


const toCamelCase = (item) => {
  if (Array.isArray(item)) {
    return item.map(el => toCamelCase(el));
  } else if (typeof item === 'function' || item !== Object(item)) {
    return item;
  }
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key.replace(/([-_][a-z])/gi, c => c.toUpperCase().replace(/[-_]/g, '')),
      toCamelCase(value),
    ]),
  );
};


export async function fetchLatestThreadId(type, userId) {
  const data = await sql`
    SELECT thread_id
    FROM pf_im_latest_thread_id
    WHERE identity = ${userId}
  `;

  return data.rows[0]['thread_id'];
}


export async function fetchThreads(type, userId) {
  const data = await sql`
    SELECT thread_id, source, title, timestamp, author, content
    FROM pf_im_threads_list
    WHERE identity = ${userId}
    ORDER BY timestamp DESC
  `;

  return toCamelCase(data.rows);
}


export async function fetchEntries(threadId, userId) {
  const data = await sql`
    SELECT *
    FROM (
      SELECT
        e.entry_id,
        e.timestamp,
        e.author,
        et.content
      FROM entries e
      INNER JOIN entry_access a USING (entry_id)
      INNER JOIN entry_text et USING (entry_id)
      WHERE e.thread_id = ${threadId}
      AND a.identity = ${userId}
      ORDER BY e.timestamp DESC
      LIMIT 1000
    )
    ORDER BY timestamp
  `;

  return toCamelCase(data.rows);
}