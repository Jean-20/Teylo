const BASE = import.meta.env.VITE_IMAGE_BASE_URL ?? ''

export const getImageUrl = (path) => `${BASE}${path}`