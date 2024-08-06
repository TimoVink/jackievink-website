'use server';

import { Pool } from 'pg';


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const sql = async (query) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query);
    return res.rows;
  } finally {
    client.release();
  }
}


const toCamelCase = (item) => {
  if (Array.isArray(item)) {
    return item.map(el => toCamelCase(el));
  } else if (typeof item === 'function' || item !== Object(item) || item instanceof Date) {
    return item;
  }
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key.replace(/([-_][a-z])/gi, c => c.toUpperCase().replace(/[-_]/g, '')),
      toCamelCase(value),
    ]),
  );
};


export async function getUserProfile(email) {
  const data = await sql(`
    SELECT ud.user_id, ul.email, ud.first_name, ud.full_name
    FROM user_lookup ul
    JOIN user_details ud USING (user_id)
    WHERE email ILIKE '${email}'
  `);

  return toCamelCase(data)[0];
}


export async function fetchAllChatThreadIds() {
  const data = await sql(`
    SELECT DISTINCT thread_id
    FROM threads
    WHERE type = 'instant-message'
  `);

  return data.map(x => x.thread_id);
}


export async function fetchLatestChatThreadId(userId) {
  const data = await sql(`
    SELECT thread_id
    FROM perf_chat_latest_thread_id
    WHERE identity = '${userId}'
  `);

  return data[0]['thread_id'];
}


export async function fetchChatThreads(userId) {
  const data = await sql(`
    SELECT thread_id, source, title, timestamp, author, content
    FROM perf_chat_threads_list
    WHERE identity = '${userId}'
    ORDER BY timestamp DESC
  `);

  return toCamelCase(data);
}


export async function fetchChatEntries(threadId, userId, limit, offset) {
  const data = await sql(`
    SELECT *
    FROM (
      SELECT
        e.entry_id,
        e.type,
        e.timestamp,
        e.author,
        et.content,
        el.text AS link_text,
        el.uri AS link_uri,
        em.type AS media_type,
        em.name AS media_name,
        em.uri AS media_uri,
        em.aspect_width AS media_aspect_width,
        em.aspect_height AS media_aspect_height,
        em.placeholder AS media_placeholder
      FROM entries e
      INNER JOIN entry_access ea USING (entry_id)
      LEFT JOIN entry_text et USING (entry_id)
      LEFT JOIN entry_links el USING (entry_id)
      LEFT JOIN entry_media em USING (entry_id)
      WHERE e.thread_id = '${threadId}'
      AND ea.identity = '${userId}'
      ORDER BY e.timestamp DESC
      LIMIT ${limit || 64} OFFSET ${offset || 0}
    ) x
    ORDER BY timestamp, type DESC, entry_id
  `);

  const result = toCamelCase(data);
  return result;
}
