import { sql } from '@vercel/postgres';
import { parseISO, subMinutes } from 'date-fns';


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


export async function fetchAllChatThreadIds() {
  const data = await sql`
    SELECT DISTINCT thread_id
    FROM threads
    WHERE type = 'instant-message'
  `;

  return data.rows.map(x => x.thread_id);
}


export async function fetchLatestChatThreadId(userId) {
  const data = await sql`
    SELECT thread_id
    FROM pf_im_latest_thread_id
    WHERE identity = ${userId}
  `;

  return data.rows[0]['thread_id'];
}


export async function fetchChatThreads(userId) {
  const data = await sql`
    SELECT thread_id, source, title, timestamp, author, content
    FROM pf_im_threads_list
    WHERE identity = ${userId}
    ORDER BY timestamp DESC
  `;

  return toCamelCase(data.rows);
}


const cleanChatEntries = (rawEntries) => {
  const result = []

  let curAuthor = null;
  let curTimestamp = new Date(1900, 1, 1);
  let curEntries = [];

  const pushGroup = () => {
    if (curEntries.length) {
      result.push({
        author: curAuthor,
        entries: curEntries
      });
      curEntries = [];
    }
  }

  const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
       if (object && object.hasOwnProperty(key)) {
          obj[key] = object[key];
       }
       return obj;
     }, {});
  }

  for (const entry of rawEntries) {
    if (entry.author !== curAuthor) {
      pushGroup();
      curAuthor = entry.author;
    }

    const newTimestamp = parseISO(entry.timestamp);
    if (subMinutes(newTimestamp, 15) > curTimestamp) {
      pushGroup();
    }
    curTimestamp = newTimestamp

    const commonProps = ['entryId', 'timestamp', 'type'];
    if (entry.type === 'im-text') {
      curEntries.push(pick(entry, [...commonProps, 'content']))
    } else if (entry.type === 'im-link') {
      curEntries.push(pick(entry, [...commonProps, 'text', 'uri']))
    }
  }
  pushGroup();

  return result;
}


export async function fetchChatEntries(threadId, userId) {
  const data = await sql`
    SELECT *
    FROM (
      SELECT
        e.entry_id,
        e.type,
        e.timestamp,
        e.author,
        et.content,
        el.text,
        el.uri
      FROM entries e
      INNER JOIN entry_access a USING (entry_id)
      LEFT JOIN entry_text et USING (entry_id)
      LEFT JOIN entry_links el USING (entry_id)
      WHERE e.thread_id = ${threadId}
      AND a.identity = ${userId}
      ORDER BY e.timestamp DESC
      LIMIT 1000
    )
    ORDER BY timestamp, type DESC
  `;

  const result = cleanChatEntries(toCamelCase(data.rows));
  return result;
}
