import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '3uu4cau1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

export function getFileUrl(file: any): string | null {
  if (!file) return null
  // Preferred: GROQ projection with asset-> already resolved the CDN url
  if (file.asset?.url) return file.asset.url
  // Fallback 1: asset._id format is "file-{id}-{ext}"
  if (file.asset?._id) {
    const parts = file.asset._id.split('-')
    if (parts.length >= 3) {
      const ext = parts[parts.length - 1]
      const id = parts.slice(1, parts.length - 1).join('-')
      return `https://cdn.sanity.io/files/3uu4cau1/production/${id}.${ext}`
    }
  }
  // Fallback 2: raw _ref before projection (format: "file-{id}-{ext}")
  if (file.asset?._ref) {
    const parts = file.asset._ref.split('-')
    if (parts.length >= 3) {
      const ext = parts[parts.length - 1]
      const id = parts.slice(1, parts.length - 1).join('-')
      return `https://cdn.sanity.io/files/3uu4cau1/production/${id}.${ext}`
    }
  }
  return null
}
