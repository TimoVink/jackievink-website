export const makeApiCall = async (url) => {
  const resp = await fetch(`${process.env.BASE_URL || ''}/${url}`)
  const text = await resp.text();

  try {
    return JSON.parse(text);
  } catch (exc) {
    console.error('Expected JSON', text);
    throw exc;
  }
}
