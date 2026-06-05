import { client } from './sanity'

// ─── Home Page ────────────────────────────────────────────────────────────────
export async function getHomePage() {
  return client.fetch(`*[_id == "homePage"][0]{
    heroVideoMp4{ asset->{ _id, url, _ref } },
    featuredProjects[]->{
      _id,
      title,
      slug,
      tag,
      category,
      posterImage{ asset->{ _id, url } },
      sliderVideoMp4{ asset->{ _id, url, _ref } },
      sliderVideoWebm{ asset->{ _id, url, _ref } }
    },
    sliderProjects[]->{
      _id,
      title,
      slug,
      tag,
      category,
      posterImage{ asset->{ _id, url } },
      sliderVideoMp4{ asset->{ _id, url, _ref } },
      sliderVideoWebm{ asset->{ _id, url, _ref } }
    },
    services[]{
      _key,
      name,
      video{ asset->{ _id, url, _ref } }
    }
  }`)
}

// ─── Showreel Page ────────────────────────────────────────────────────────────
export async function getShowreelPage() {
  return client.fetch(`{
    "page": *[_id == "showreelPage"][0]{ pageTitle },
    "projects": *[_type == "project" && category == "showreel"] | order(order asc) {
      _id,
      title,
      slug,
      tag,
      category,
      order,
      posterImage{ asset->{ _id, url } },
      sliderVideoMp4{ asset->{ _id, url, _ref } },
      sliderVideoWebm{ asset->{ _id, url, _ref } }
    }
  }`)
}

// ─── Shortfilms Page ──────────────────────────────────────────────────────────
export async function getShortfilmsPage() {
  return client.fetch(`{
    "page": *[_id == "shortfilmsPage"][0]{ pageTitle },
    "projects": *[_type == "project" && category == "shortfilms"] | order(order asc) {
      _id,
      title,
      slug,
      tag,
      category,
      order,
      posterImage{ asset->{ _id, url } },
      sliderVideoMp4{ asset->{ _id, url, _ref } },
      sliderVideoWebm{ asset->{ _id, url, _ref } }
    }
  }`)
}

// ─── Single Project ───────────────────────────────────────────────────────────
export async function getProject(slug: string) {
  return client.fetch(`*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    category,
    tag,
    location,
    coordinates,
    vimeoUrl,
    projectVideoMp4{ asset->{ _id, url, _ref } },
    posterImage{ asset->{ _id, url } },
    pageBuilder[]{
      _type,
      _key,
      text,
      headingLines,
      image{ asset->{ _id, url } },
      alt,
      heading,
      images[]{ asset->{ _id, url }, _key },
      reelUrl,
      useExtraSmall
    },
    nextProject->{
      _id,
      title,
      slug,
      category
    }
  }`, { slug })
}

// ─── About Page ───────────────────────────────────────────────────────────────
export async function getAboutPage() {
  return client.fetch(`*[_id == "aboutPage"][0]{
    headline,
    subheadline,
    aboutVideo{ asset->{ _id, url, _ref } },
    targetImageDesktop{ asset->{ _id, url } },
    targetImageMobile{ asset->{ _id, url } },
    bottomImage{ asset->{ _id, url } },
    contactBannerText
  }`)
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
export async function getContactPage() {
  return client.fetch(`*[_id == "contactPage"][0]{ typeformUrl }`)
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export async function getSiteSettings() {
  return client.fetch(`*[_id == "siteSettings"][0]{
    title,
    description,
    email,
    instagram,
    copyright
  }`)
}
