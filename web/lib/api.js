import { useSuspenseQuery } from '@tanstack/react-query'


const defaultOptions = {
  staleTime: 24 * 60 * 60 * 1000 // 1 day
};

export const makeRawApiCall = (url) => {
  const fullUrl = !url.startsWith('http')
    ? `${process.env.BASE_URL || ''}/${url}`
    : url;
  const result = fetch(fullUrl);
  return result;
};

export const makeApiCall = (url) => makeRawApiCall(url).then(x => x.json());

export const makeTextApiCall = (url) => makeRawApiCall(url).then(x => x.text());

export const useApiCall = (url, options) => useSuspenseQuery({
    queryKey: [url],
    queryFn: () => makeApiCall(url),
    ...{ ...defaultOptions, ...options }
});

export const useTextApiCall = (url, options) => useSuspenseQuery({
  queryKey: [url],
  queryFn: () => makeTextApiCall(url),
  ...{ ...defaultOptions, ...options }
});
