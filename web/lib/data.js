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


export async function fetchChatThreads(userId) {
  const data = await sql(`
    SELECT
      thread_id,
      source,
      title,
      content,
      timestamp,
      author_id,
      author_first_name,
      author_full_name
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
        ud.user_id AS author_id,
        ud.first_name AS author_first_name,
        ud.full_name AS author_full_name,
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
      INNER JOIN user_details ud ON (e.author = ud.user_id)
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


export async function fetchEmailThreads(userId) {
  const data = await sql(`
    SELECT
      thread_id,
      subject,
      preview,
      timestamp,
      author_id,
      author_first_name,
      author_full_name
    FROM perf_email_threads_list
    WHERE identity = '${userId}'
    ORDER BY timestamp DESC
  `);

  return toCamelCase(data);
}


export async function fetchEmailEntries(threadId, userId) {
  // First grab the entries
  const emailData = await sql(`
    SELECT DISTINCT
      e.entry_id,
      e.timestamp,
      ud.user_id AS author_id,
      ud.first_name as author_first_name,
      ud.full_name as author_full_name,
      em.subject AS email_subject,
      em.uri AS email_uri
    FROM entries e
    INNER JOIN entry_access ea USING (entry_id)
    INNER JOIN entry_emails em USING (entry_id)
    LEFT JOIN user_details ud ON e.author = ud.user_id
    WHERE e.thread_id = '${threadId}'
    AND ea.identity = '${userId}'
    ORDER BY e.timestamp
  `);
  const result = toCamelCase(emailData);

  // Then augment with the attachments
  const mediaData = await sql(`
    SELECT
      e.entry_id,
      em.name,
      em.uri
    FROM entries e
    INNER JOIN entry_access ea USING (entry_id)
    INNER JOIN entry_media em USING (entry_id)
    WHERE e.thread_id = '${threadId}'
    AND ea.identity = '${userId}'
    ORDER BY em.name
  `);
  const mediaLookup = mediaData.reduce((acc, { entry_id, name, uri }) => {
    acc[entry_id] = acc[entry_id] || [];
    acc[entry_id].push({ name, uri });
    return acc;
  }, {});
  for (const entry of result) {
    entry['media'] = mediaLookup[entry.entryId] ?? [];
  }
  console.log(result);

  return result;
}


export async function fetchMediaItems(userId, limit, offset) {
  const data = await sql(`
    SELECT *
    FROM (
      SELECT DISTINCT ON (media_uri) *
      FROM (
        SELECT
          e.entry_id,
          e.timestamp,
          e.author,
          em.type AS media_type,
          em.name AS media_name,
          em.uri AS media_uri,
          em.aspect_width AS media_aspect_width,
          em.aspect_height AS media_aspect_height,
          em.placeholder AS media_placeholder
        FROM entries e
        INNER JOIN entry_access ea USING (entry_id)
        INNER JOIN entry_media em USING (entry_id)
        WHERE ea.identity = '${userId}'
        AND author IN ('${userId}', 'jackie.vink')
        ORDER BY e.timestamp
      ) x2
    ) x1
    ORDER BY timestamp DESC
    LIMIT ${limit || 128} OFFSET ${offset || 0}
  `);

  const result = toCamelCase(data);
  return result;
}
