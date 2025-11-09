export const optimizeImage = (url, width = 300) => {
  return `${url}?w=${width}&q=75&format=webp`;
};