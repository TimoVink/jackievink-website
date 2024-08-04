import { useSuspenseQuery } from '@tanstack/react-query'


const defaultOptions = {
  staleTime: 24 * 60 * 60 * 1000 // 1 day
};

export const useApiCall = (url, options) => useSuspenseQuery({
    queryKey: [url],
    queryFn: () => fetch(`${process.env.BASE_URL || ''}/${url}`).then(x => x.json()),
    ...{ ...defaultOptions, ...options }
});
