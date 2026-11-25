import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://angb.fr').replace(/\/$/, '')
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/association`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/savoir`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/actualites`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/entraineurs`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/stages`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/annuaire`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/forum`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/equipement`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politique-confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
