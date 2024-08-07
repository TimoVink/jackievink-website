import { useSuspenseQuery } from '@tanstack/react-query'


const defaultOptions = {
  staleTime: 24 * 60 * 60 * 1000 // 1 day
};

export const makeApiCall = (url) => fetch(`${process.env.BASE_URL || ''}/${url}`).then(x => x.json());

export const useApiCall = (url, options) => useSuspenseQuery({
    queryKey: [url],
    queryFn: () => makeApiCall(url),
    ...{ ...defaultOptions, ...options }
});
