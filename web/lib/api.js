export const makeApiCall = (url) => fetch(`${process.env.BASE_URL || ''}/${url}`).then(x => x.json());
