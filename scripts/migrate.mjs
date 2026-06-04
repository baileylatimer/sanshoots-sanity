/**
 * SANSHOOTS Migration Script
 * Migrates all content from sanshoots-gatsby to Sanity (project ID: 3uu4cau1)
 *
 * Run: node scripts/migrate.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GATSBY_ROOT = path.resolve(__dirname, '../../sanshoots-gatsby/src')

const client = createClient({
  projectId: '3uu4cau1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skhgAZfPx6GhMVeNjO969OCOKVkaUML3E1yLBNV9XjI5O5YRKtfI9WB8Sn8EO9PK34vDtCL86QRpddkBz4kWPcTH10jQL0ZROfUfKYQ8OryRbV6VcBOZY8P4qMgowK6zxpkpB4EKGrGCQuhYs6Vu4fYTd28zdLrQbWbaRMUpWQ6UhUj3lnWe',
  useCdn: false,
})

// ─── Asset upload cache (avoid re-uploading same file) ───────────────────────
const assetCache = new Map()

async function uploadFile(filePath, type = 'image') {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${filePath}`)
    return null
  }
  if (assetCache.has(filePath)) {
    return assetCache.get(filePath)
  }
  const stream = fs.createReadStream(filePath)
  const filename = path.basename(filePath)
  console.log(`  ↑ Uploading ${type}: ${filename}`)
  try {
    const asset = await client.assets.upload(type, stream, { filename })
    const ref = { _type: 'reference', _ref: asset._id }
    assetCache.set(filePath, ref)
    return ref
  } catch (err) {
    console.error(`  ✗ Failed to upload ${filename}:`, err.message)
    return null
  }
}

async function uploadImage(relPath) {
  const full = path.join(GATSBY_ROOT, 'images', relPath)
  const ref = await uploadFile(full, 'image')
  if (!ref) return null
  return { _type: 'image', asset: ref }
}

async function uploadVideo(relPath) {
  const full = path.join(GATSBY_ROOT, 'videos', relPath)
  const ref = await uploadFile(full, 'file')
  if (!ref) return null
  return { _type: 'file', asset: ref }
}

// ─── All project data (extracted from Gatsby pages) ──────────────────────────

const PROJECTS = [
  // ── SHOWREEL ──────────────────────────────────────────────────────────────
  {
    slug: 'elyanna',
    category: 'showreel',
    order: 1,
    title: 'Elyanna',
    tag: 'Event',
    location: 'Santa Ana, CA, USA',
    coordinates: '33.7455° N, 117.8677° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'elyanna.jpg',
    sliderVideoMp4: 'elyanna-2.mp4',
    sliderVideoWebm: 'elyanna-2.webm',
    nextProjectSlug: 'yung-bans',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Meet Elyanna', 'a revolutionary Palestinian artist'] },
      { type: 'imageBlock', image: 'elyanna/elyanna-sanshoots--19.jpg' },
      { type: 'paragraphBlock', heading: 'Telling Her Story', text: 'Elyanna, a Palestinian artist, blends traditional Arabic music with contemporary pop in her dynamic performances. Her 2024 Los Angeles tour was a visual and auditory feast, with stunning stage sets capturing the essence of her music.' },
      { type: 'galleryBlock', images: ['elyanna/elyanna-sanshoots--10.jpg', 'elyanna/elyanna-sanshoots--18.jpg', 'elyanna/elyanna-sanshoots--11.jpg', 'elyanna/elyanna-sanshoots--4.jpg'] },
      { type: 'paragraphBlock', heading: 'Putting it together', text: 'Editing this project involved meticulous color grading to manage concert lighting, achieving a beautiful, cohesive look. Working with Elyanna and her team, especially her talented brother Feras, was an incredible experience. This recap showcases Sanshoots dedication to sharp imagery and engaging storytelling. Relive the magic of Elyannas LA tour—this is a visual experience you wont want to miss.' },
      { type: 'imageBlock', image: 'elyanna/elyanna-sanshoots--15.jpg' },
      { type: 'paragraphBlock', heading: 'In conclusion', text: "Sanshoots was honored to capture the highlight moments and energy of her show. Using the Sony A7Siii with a 24-70mm f/2.8 G Master lens and a Ronin stabilizer, we shot in 4K 4:2:2 10-bit at 120 FPS and 60 FPS, creating dynamic visuals. The brilliantly directed lighting and stage design by Elyanna's team provided the perfect backdrop." },
    ],
  },
  {
    slug: 'yung-bans',
    category: 'showreel',
    order: 2,
    title: 'Yung Bans',
    tag: 'Music Video',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'yung-bans.jpg',
    sliderVideoMp4: 'yung-bans.mp4',
    sliderVideoWebm: 'yung-bans.webm',
    nextProjectSlug: 'paliroots',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Yung Bans', 'Music Video Production'] },
      { type: 'imageBlock', image: 'yung-bans/yung-bans-sanshoots--2.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'A high-energy music video production for Yung Bans, capturing the artist\'s unique style and vision through dynamic cinematography and creative direction.' },
      { type: 'galleryBlock', images: ['yung-bans/yung-bans-sanshoots--3.jpg', 'yung-bans/yung-bans-sanshoots--14.jpg', 'yung-bans/yung-bans-sanshoots--21.jpg', 'yung-bans/yung-bans-sanshoots--24.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This project showcases Sanshoots\' ability to deliver compelling music video content that resonates with audiences and elevates the artist\'s brand.' },
    ],
  },
  {
    slug: 'paliroots',
    category: 'showreel',
    order: 3,
    title: 'Paliroots',
    tag: 'Apparel',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'paliroots.jpg',
    sliderVideoMp4: 'paliroots.mp4',
    sliderVideoWebm: 'paliroots.webm',
    nextProjectSlug: 'francis-mercier',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Paliroots', 'Apparel Brand Story'] },
      { type: 'imageBlock', image: 'paliroots/paliroots-sanshoots--11.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Paliroots is a Palestinian-inspired apparel brand with a powerful message. We captured their brand story through cinematic visuals that honor their heritage and mission.' },
      { type: 'galleryBlock', images: ['paliroots/paliroots-sanshoots--12.jpg', 'paliroots/paliroots-sanshoots--14.jpg', 'paliroots/paliroots-sanshoots--16.jpg', 'paliroots/paliroots-sanshoots--17.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The final video beautifully represents the Paliroots brand, connecting with their audience on a deep cultural and emotional level.' },
    ],
  },
  {
    slug: 'francis-mercier',
    category: 'showreel',
    order: 4,
    title: 'Francis Mercier',
    tag: 'Event',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'francis-mercier.jpg',
    sliderVideoMp4: 'francis-mercier.mp4',
    sliderVideoWebm: 'francis-mercier.webm',
    nextProjectSlug: 'nour-ardakani',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Francis Mercier', 'Live Event Coverage'] },
      { type: 'imageBlock', image: 'francis-mercier/francis-mercier-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Francis Mercier is a world-renowned DJ known for his Afro House sets. We captured the energy and atmosphere of his live performance with dynamic multi-camera coverage.' },
      { type: 'galleryBlock', images: ['francis-mercier/francis-mercier-sanshoots--2.jpg', 'francis-mercier/francis-mercier-sanshoots--3.jpg', 'francis-mercier/francis-mercier-sanshoots--4.jpg', 'francis-mercier/francis-mercier-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The event recap video perfectly encapsulates the electric atmosphere of a Francis Mercier performance, delivering a visual experience that matches his musical energy.' },
    ],
  },
  {
    slug: 'nour-ardakani',
    category: 'showreel',
    order: 5,
    title: 'Nour Ardakani',
    tag: 'Music Video',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'nour-ardakani.jpg',
    sliderVideoMp4: 'nour-ardakani.mp4',
    sliderVideoWebm: 'nour-ardakani.webm',
    nextProjectSlug: 'bluemoon',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Nour Ardakani', 'Music Video'] },
      { type: 'imageBlock', image: 'nour-ardakani/nour-ardakani-sanshoots--10.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'A visually stunning music video for rising artist Nour Ardakani, blending cinematic storytelling with powerful performance footage.' },
      { type: 'galleryBlock', images: ['nour-ardakani/nour-ardakani-sanshoots--11.jpg', 'nour-ardakani/nour-ardakani-sanshoots--17.jpg', 'nour-ardakani/nour-ardakani-sanshoots--7.jpg', 'nour-ardakani/nour-ardakani-sanshoots--8.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The music video showcases Sanshoots\' ability to create compelling visual narratives that complement and elevate an artist\'s musical vision.' },
    ],
  },
  {
    slug: 'bluemoon',
    category: 'showreel',
    order: 6,
    title: 'Bluemoon',
    tag: 'Jewelry',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'bluemoon.jpg',
    sliderVideoMp4: 'bluemoon.mp4',
    sliderVideoWebm: 'bluemoon.webm',
    nextProjectSlug: 'axe',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Bluemoon', 'Jewelry Brand Film'] },
      { type: 'imageBlock', image: 'bluemoon/bluemoon-sanshoots--12.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Bluemoon is a luxury jewelry brand. We created a cinematic brand film that captures the elegance and craftsmanship behind each piece.' },
      { type: 'galleryBlock', images: ['bluemoon/bluemoon-sanshoots--31.jpg', 'bluemoon/bluemoon-sanshoots--39.jpg', 'bluemoon/bluemoon-sanshoots--9.jpg', 'bluemoon/bluemoon-sanshoots--12.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The brand film beautifully showcases the artistry of Bluemoon jewelry, creating desire and aspiration in the viewer.' },
    ],
  },
  {
    slug: 'axe',
    category: 'showreel',
    order: 7,
    title: 'Axe',
    tag: 'Beauty',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'axe.jpg',
    sliderVideoMp4: 'axe.mp4',
    sliderVideoWebm: 'axe.webm',
    nextProjectSlug: 'gillette',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ["Alejandro Rosario's Active Lifestyle Fueled by Axe"] },
      { type: 'imageBlock', image: 'axe/axe-sanshoots--3.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: "Axe, synonymous with youthful masculinity and confidence, partnered with Alejandro Rosario for a short commercial. The concept showcased Alejandro's morning routine and active lifestyle, emphasizing how Axe body spray keeps him fresh while playing soccer." },
      { type: 'galleryBlock', images: ['axe/axe-sanshoots--9.jpg', 'axe/axe-sanshoots--10.jpg', 'axe/axe-sanshoots--7.jpg', 'axe/axe-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'Putting it together', text: "Filming took place at a soccer field in Los Angeles, with a tight 4-hour window. We used the Sony A7Siii with a 24-70mm f/2.8 G Master lens and a Ronin stabilizer, shooting in 4K 4:2:2 10-bit at 120 FPS and 60 FPS for dynamic slow-motion shots. The shoot required quick setups and efficient teamwork to capture all necessary footage within the limited time." },
      { type: 'imageBlock', image: 'axe/axe-sanshoots--15.jpg' },
      { type: 'paragraphBlock', heading: 'In conclusion', text: "Collaborating with Alejandro and Axe was fantastic. The final video received excellent feedback, driving significant engagement and sales on TikTok and IG reels. This project showcases Sanshoots' ability to create impactful content under tight deadlines." },
    ],
  },
  {
    slug: 'gillette',
    category: 'showreel',
    order: 8,
    title: 'Gillette',
    tag: 'Beauty',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'gillette.jpg',
    sliderVideoMp4: 'gillette.mp4',
    sliderVideoWebm: 'gillette.webm',
    nextProjectSlug: 'celsius',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Gillette', 'Brand Commercial'] },
      { type: 'imageBlock', image: 'gillette/gillette-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'A dynamic commercial for Gillette showcasing their latest product line through high-energy lifestyle footage and product close-ups.' },
      { type: 'galleryBlock', images: ['gillette/gillette-sanshoots--2.jpg', 'gillette/gillette-sanshoots--6.jpg', 'gillette/gillette-sanshoots--7.jpg', 'gillette/gillette-sanshoots--15.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The Gillette commercial effectively communicates the brand\'s message of confidence and performance through compelling visual storytelling.' },
    ],
  },
  {
    slug: 'celsius',
    category: 'showreel',
    order: 9,
    title: 'Celsius',
    tag: 'Food/Beverage',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'celsius.jpg',
    sliderVideoMp4: 'celsius.mp4',
    sliderVideoWebm: 'celsius.webm',
    nextProjectSlug: 'high-end-exotics',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Celsius', 'Energy Drink Campaign'] },
      { type: 'imageBlock', image: 'celsius/celsius-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Celsius energy drink campaign featuring high-energy lifestyle content that resonates with their active, health-conscious audience.' },
      { type: 'galleryBlock', images: ['celsius/celsius-sanshoots--2.jpg', 'celsius/celsius-sanshoots--4.jpg', 'celsius/celsius-sanshoots--9.jpg', 'celsius/celsius-sanshoots--13.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The campaign content drove strong engagement across social media platforms, effectively communicating the Celsius brand identity.' },
    ],
  },
  {
    slug: 'high-end-exotics',
    category: 'showreel',
    order: 10,
    title: 'High-End Exotics',
    tag: 'Auto',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'high-end-exotics.jpg',
    sliderVideoMp4: 'highendexotics.mp4',
    sliderVideoWebm: 'highendexotics.webm',
    nextProjectSlug: 'the-hartford-group',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['High-End Exotics', 'Automotive Showcase'] },
      { type: 'imageBlock', image: 'high-end-exotics/high-end-exotics-sanshoots--4.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'High-End Exotics is a premier exotic car dealership. We created a cinematic showcase that captures the beauty and performance of their fleet.' },
      { type: 'galleryBlock', images: ['high-end-exotics/high-end-exotics-sanshoots--5.jpg', 'high-end-exotics/high-end-exotics-sanshoots--6.jpg', 'high-end-exotics/high-end-exotics-sanshoots--7.jpg', 'high-end-exotics/high-end-exotics-sanshoots--11.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The automotive showcase video elevated the High-End Exotics brand, attracting high-net-worth clients and driving significant business growth.' },
    ],
  },
  {
    slug: 'the-hartford-group',
    category: 'showreel',
    order: 11,
    title: 'The Hartford Group',
    tag: 'Hospitality',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'thg.jpg',
    sliderVideoMp4: 'thehartfordgroup.mp4',
    sliderVideoWebm: 'thehartfordgroup.webm',
    nextProjectSlug: 'united-mission-relief',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['The Hartford Group', 'Hospitality Brand Film'] },
      { type: 'imageBlock', image: 'the-hartford-group/the-hartford-group-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'The Hartford Group is a premier hospitality company. We created a brand film that showcases their properties and the exceptional experiences they offer.' },
      { type: 'galleryBlock', images: ['the-hartford-group/the-hartford-group-sanshoots--2.jpg', 'the-hartford-group/the-hartford-group-sanshoots--3.jpg', 'the-hartford-group/the-hartford-group-sanshoots--4.jpg', 'the-hartford-group/the-hartford-group-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The brand film effectively communicates the luxury and exclusivity of The Hartford Group experience, driving bookings and brand awareness.' },
    ],
  },
  {
    slug: 'united-mission-relief',
    category: 'showreel',
    order: 12,
    title: 'United Mission Relief',
    tag: 'NGO',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'umr-relief.jpg',
    sliderVideoMp4: 'umr-relief.mp4',
    sliderVideoWebm: 'umr-relief.webm',
    nextProjectSlug: 'intuitive-foundation',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['United Mission Relief', 'NGO Impact Film'] },
      { type: 'imageBlock', image: 'united-mission-relief/united-mission-relief-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'United Mission Relief is a humanitarian organization dedicated to providing aid to those in need. We created an impact film that tells the story of their mission and the lives they touch.' },
      { type: 'galleryBlock', images: ['united-mission-relief/united-mission-relief-sanshoots--2.jpg', 'united-mission-relief/united-mission-relief-sanshoots--3.jpg', 'united-mission-relief/united-mission-relief-sanshoots--4.jpg', 'united-mission-relief/united-mission-relief-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The impact film successfully communicated the importance of UMR\'s work, driving donations and volunteer sign-ups.' },
    ],
  },
  {
    slug: 'intuitive-foundation',
    category: 'showreel',
    order: 13,
    title: 'Intuitive Foundation',
    tag: 'Retreat',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'intuitive-foundation.jpg',
    sliderVideoMp4: 'intuitive-foundation.mp4',
    sliderVideoWebm: 'intuitive-foundation.webm',
    nextProjectSlug: 'eminent-collaborations',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Intuitive Foundation', 'Wellness Retreat Film'] },
      { type: 'imageBlock', image: 'intuitive-foundation/intuitive-foundation-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Intuitive Foundation offers transformative wellness retreats. We captured the serene beauty of their retreat experience through cinematic visuals.' },
      { type: 'galleryBlock', images: ['intuitive-foundation/intuitive-foundation-sanshoots--2.jpg', 'intuitive-foundation/intuitive-foundation-sanshoots--3.jpg', 'intuitive-foundation/intuitive-foundation-sanshoots--4.jpg', 'intuitive-foundation/intuitive-foundation-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The retreat film beautifully captures the transformative experience offered by Intuitive Foundation, inspiring viewers to embark on their own wellness journey.' },
    ],
  },
  {
    slug: 'eminent-collaborations',
    category: 'showreel',
    order: 14,
    title: 'Eminent Collaborations',
    tag: 'NGO',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'eminent-collaborations.jpg',
    sliderVideoMp4: 'eminent-collaborations.mp4',
    sliderVideoWebm: 'eminent-collaborations.webm',
    nextProjectSlug: 'el-silencio-glamping',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Eminent Collaborations', 'Community Impact'] },
      { type: 'imageBlock', image: 'united-mission-relief/united-mission-relief-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Eminent Collaborations brings together community leaders and organizations to create positive change. We documented their impactful work through compelling visual storytelling.' },
      { type: 'galleryBlock', images: ['united-mission-relief/united-mission-relief-sanshoots--2.jpg', 'united-mission-relief/united-mission-relief-sanshoots--3.jpg', 'united-mission-relief/united-mission-relief-sanshoots--4.jpg', 'united-mission-relief/united-mission-relief-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The documentary-style film effectively communicates the mission and impact of Eminent Collaborations, inspiring others to get involved.' },
    ],
  },
  {
    slug: 'el-silencio-glamping',
    category: 'showreel',
    order: 15,
    title: 'El Silencio Glamping',
    tag: 'Hospitality',
    location: 'Colombia',
    coordinates: '4.7110° N, 74.0721° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'el-silencio-glamping.jpg',
    sliderVideoMp4: 'el-silencio-glamping.mp4',
    sliderVideoWebm: 'el-silencio-glamping.webm',
    nextProjectSlug: 'elyanna',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['El Silencio Glamping', 'Colombia Retreat'] },
      { type: 'imageBlock', image: 'el-silencio-glamping/el-silencio-glamping-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'El Silencio Glamping is a stunning luxury camping experience nestled in the Colombian mountains. We captured the breathtaking natural beauty and unique accommodations.' },
      { type: 'galleryBlock', images: ['el-silencio-glamping/el-silencio-glamping-sanshoots--2.jpg', 'el-silencio-glamping/el-silencio-glamping-sanshoots--3.jpg', 'el-silencio-glamping/el-silencio-glamping-sanshoots--4.jpg', 'el-silencio-glamping/el-silencio-glamping-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The promotional film for El Silencio Glamping beautifully showcases the unique experience, driving bookings from adventure-seeking travelers worldwide.' },
    ],
  },

  // ── SHORTFILMS ────────────────────────────────────────────────────────────
  {
    slug: 'palestine-activated',
    category: 'shortfilms',
    order: 1,
    title: 'Palestine Activated',
    tag: 'Cinematic',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'palestine-activated.jpg',
    sliderVideoMp4: 'palestine-activated.mp4',
    sliderVideoWebm: 'palestine-activated.webm',
    nextProjectSlug: 'palestine-will-be',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Palestine Activated', 'A Call to Action'] },
      { type: 'imageBlock', image: 'palestine-activated/palestine-activated-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Palestine Activated is a powerful cinematic piece that documents the activism and resilience of the Palestinian community in Los Angeles.' },
      { type: 'galleryBlock', images: ['palestine-activated/palestine-activated-sanshoots--2.jpg', 'palestine-activated/palestine-activated-sanshoots--3.jpg', 'palestine-activated/palestine-activated-sanshoots--4.jpg', 'palestine-activated/palestine-activated-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film stands as a testament to the power of community and the importance of bearing witness to history through the lens of cinema.' },
    ],
  },
  {
    slug: 'palestine-will-be',
    category: 'shortfilms',
    order: 2,
    title: 'Palestine Will Be',
    tag: 'Cinematic',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'palestine-will-be.jpg',
    sliderVideoMp4: 'palestine-will-be.mp4',
    sliderVideoWebm: 'palestine-will-be.webm',
    nextProjectSlug: 'chaos-to-calm',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Palestine Will Be', 'A Vision of Hope'] },
      { type: 'imageBlock', image: 'palestine-will-be/palestine-will-be-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Palestine Will Be is a cinematic short film that envisions a future of peace and freedom for Palestine, told through powerful imagery and narrative.' },
      { type: 'galleryBlock', images: ['palestine-will-be/palestine-will-be-sanshoots--2.jpg', 'palestine-will-be/palestine-will-be-sanshoots--3.jpg', 'palestine-will-be/palestine-will-be-sanshoots--4.jpg', 'palestine-will-be/palestine-will-be-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film is a love letter to Palestine and its people, a reminder that hope and resilience endure even in the darkest of times.' },
    ],
  },
  {
    slug: 'chaos-to-calm',
    category: 'shortfilms',
    order: 3,
    title: 'Chaos to Calm',
    tag: 'Shortfilm',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'chaos-to-calm.jpg',
    sliderVideoMp4: 'chaos-to-calm.mp4',
    sliderVideoWebm: 'chaos-to-calm.webm',
    nextProjectSlug: 'tesla-cybertruck',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Chaos to Calm', 'A Journey Within'] },
      { type: 'imageBlock', image: 'chaos-to-calm/chaos-to-calm-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Chaos to Calm is a personal short film exploring the journey from mental chaos to inner peace through meditation and mindfulness practices.' },
      { type: 'galleryBlock', images: ['chaos-to-calm/chaos-to-calm-sanshoots--2.jpg', 'chaos-to-calm/chaos-to-calm-sanshoots--3.jpg', 'chaos-to-calm/chaos-to-calm-sanshoots--4.jpg', 'chaos-to-calm/chaos-to-calm-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film resonated deeply with audiences, sparking conversations about mental health and the importance of finding stillness in a chaotic world.' },
    ],
  },
  {
    slug: 'tesla-cybertruck',
    category: 'shortfilms',
    order: 4,
    title: 'Tesla Cybertruck',
    tag: 'Auto',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'tesla-cybertruck.jpg',
    sliderVideoMp4: 'tesla-cybertruck.mp4',
    sliderVideoWebm: 'tesla-cybertruck.webm',
    nextProjectSlug: 'life-is-good',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Tesla Cybertruck', 'The Future of Automotive'] },
      { type: 'imageBlock', image: 'tesla-cybertruck/tesla-cybertruck-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'The Tesla Cybertruck is unlike any vehicle ever made. We created a cinematic showcase that captures its futuristic design and raw power.' },
      { type: 'galleryBlock', images: ['tesla-cybertruck/tesla-cybertruck-sanshoots--2.jpg', 'tesla-cybertruck/tesla-cybertruck-sanshoots--3.jpg', 'tesla-cybertruck/tesla-cybertruck-sanshoots--4.jpg', 'tesla-cybertruck/tesla-cybertruck-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The Cybertruck film went viral on social media, garnering millions of views and establishing Sanshoots as a go-to studio for automotive content.' },
    ],
  },
  {
    slug: 'life-is-good',
    category: 'shortfilms',
    order: 5,
    title: 'Life is Good',
    tag: 'Cinematic',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'life-is-good.jpg',
    sliderVideoMp4: 'life-is-good.mp4',
    sliderVideoWebm: 'life-is-good.webm',
    nextProjectSlug: 'raceexotics-oc-meet',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Life is Good', 'A Celebration of Living'] },
      { type: 'imageBlock', image: 'life-is-good/life-is-good-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Life is Good is a cinematic celebration of the simple joys and beautiful moments that make life worth living.' },
      { type: 'galleryBlock', images: ['life-is-good/life-is-good-sanshoots--2.jpg', 'life-is-good/life-is-good-sanshoots--3.jpg', 'life-is-good/life-is-good-sanshoots--4.jpg', 'life-is-good/life-is-good-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film serves as a reminder to appreciate the present moment and find beauty in everyday life.' },
    ],
  },
  {
    slug: 'raceexotics-oc-meet',
    category: 'shortfilms',
    order: 6,
    title: 'Race Exotics OC Meet',
    tag: 'Auto',
    location: 'Orange County, CA, USA',
    coordinates: '33.7175° N, 117.8311° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'raceexotics-oc-meet.jpg',
    sliderVideoMp4: 'raceexotics-oc-meet.mp4',
    sliderVideoWebm: 'raceexotics-oc-meet.webm',
    nextProjectSlug: 'forever-on-my-mind',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Race Exotics OC Meet', 'Automotive Culture'] },
      { type: 'imageBlock', image: 'race-exotics/race-exotics-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'The Race Exotics OC Meet brings together the finest exotic cars in Orange County. We captured the energy, passion, and community of this iconic automotive event.' },
      { type: 'galleryBlock', images: ['race-exotics/race-exotics-sanshoots--2.jpg', 'race-exotics/race-exotics-sanshoots--3.jpg', 'race-exotics/race-exotics-sanshoots--4.jpg', 'race-exotics/race-exotics-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'The event film perfectly captures the excitement and camaraderie of the Race Exotics community, becoming a beloved piece of automotive culture content.' },
    ],
  },
  {
    slug: 'forever-on-my-mind',
    category: 'shortfilms',
    order: 7,
    title: 'Forever on My Mind',
    tag: 'Travel',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'forever-on-my-mind.jpg',
    sliderVideoMp4: 'forever-on-my-mind.mp4',
    sliderVideoWebm: 'forever-on-my-mind.webm',
    nextProjectSlug: 'breathe',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Forever on My Mind', 'A Travel Story'] },
      { type: 'imageBlock', image: 'forever-on-my-mind/forever-on-my-mind-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Forever on My Mind is a travel film that captures the beauty of exploration and the memories that stay with us long after we return home.' },
      { type: 'galleryBlock', images: ['forever-on-my-mind/forever-on-my-mind-sanshoots--2.jpg', 'forever-on-my-mind/forever-on-my-mind-sanshoots--3.jpg', 'forever-on-my-mind/forever-on-my-mind-sanshoots--4.jpg', 'forever-on-my-mind/forever-on-my-mind-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This travel film inspires wanderlust and reminds viewers of the transformative power of travel and new experiences.' },
    ],
  },
  {
    slug: 'breathe',
    category: 'shortfilms',
    order: 8,
    title: 'Breathe',
    tag: 'Cinematic',
    location: 'Pacific Beach, CA, USA',
    coordinates: '32.8025° N, 117.2356° W',
    vimeoUrl: 'https://vimeo.com/990321433',
    posterImage: 'breathe.jpg',
    sliderVideoMp4: 'breathe.mp4',
    sliderVideoWebm: 'breathe.webm',
    nextProjectSlug: 'ob-vibes',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['A Serene Escape to Inner Peace and Stillness'] },
      { type: 'imageBlock', image: 'breathe/breathe-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: "Breathe was shot in Palisades Park, Pacific Beach, San Diego, capturing moments of meditation and relaxation. Initially planned as a personal shoot, the footage transformed into a project that encourages taking a moment to breathe amidst life's busyness." },
      { type: 'galleryBlock', images: ['breathe/breathe-sanshoots--2.jpg', 'breathe/breathe-sanshoots--3.jpg', 'breathe/breathe-sanshoots--4.jpg', 'breathe/breathe-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'Putting it together', text: "This project highlights Sanshoots' ability to create serene and introspective visual stories, reminding viewers to pause, breathe, and recharge." },
      { type: 'imageBlock', image: 'breathe/breathe-sanshoots--6.jpg' },
      { type: 'paragraphBlock', heading: 'In conclusion', text: "Collaborating on Breathe was fantastic. The final video received excellent feedback, driving significant engagement and sales on TikTok and IG reels. This project showcases Sanshoots' ability to create impactful content under tight deadlines." },
    ],
  },
  {
    slug: 'ob-vibes',
    category: 'shortfilms',
    order: 9,
    title: 'OB Vibes',
    tag: 'Storytelling',
    location: 'Ocean Beach, CA, USA',
    coordinates: '32.7490° N, 117.2534° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'ob-vibes.jpg',
    sliderVideoMp4: 'ob-vibes.mp4',
    sliderVideoWebm: 'ob-vibes.webm',
    nextProjectSlug: 'glimpse-of-home',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['OB Vibes', 'Ocean Beach Stories'] },
      { type: 'imageBlock', image: 'ob-vibes/ob-vibes-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'OB Vibes captures the unique culture and laid-back lifestyle of Ocean Beach, San Diego through intimate storytelling and stunning visuals.' },
      { type: 'galleryBlock', images: ['ob-vibes/ob-vibes-sanshoots--2.jpg', 'ob-vibes/ob-vibes-sanshoots--3.jpg', 'ob-vibes/ob-vibes-sanshoots--4.jpg', 'ob-vibes/ob-vibes-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film is a love letter to Ocean Beach and its community, capturing the essence of a place that feels like home.' },
    ],
  },
  {
    slug: 'glimpse-of-home',
    category: 'shortfilms',
    order: 10,
    title: 'Glimpse of Home',
    tag: 'Travel',
    location: 'Palestine',
    coordinates: '31.9522° N, 35.2332° E',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'glimpse-of-home.jpg',
    sliderVideoMp4: 'glimpse-of-home.mp4',
    sliderVideoWebm: 'glimpse-of-home.webm',
    nextProjectSlug: 'die-one-day',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Glimpse of Home', 'A Journey to Palestine'] },
      { type: 'imageBlock', image: 'glimpse-of-home/glimpse-of-home-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Glimpse of Home is a deeply personal travel film documenting a journey to Palestine, capturing the beauty, culture, and resilience of the land and its people.' },
      { type: 'galleryBlock', images: ['glimpse-of-home/glimpse-of-home-sanshoots--2.jpg', 'glimpse-of-home/glimpse-of-home-sanshoots--3.jpg', 'glimpse-of-home/glimpse-of-home-sanshoots--4.jpg', 'glimpse-of-home/glimpse-of-home-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film serves as a window into Palestine for those who have never visited, and a reminder of home for those who have.' },
    ],
  },
  {
    slug: 'die-one-day',
    category: 'shortfilms',
    order: 11,
    title: 'Die One Day',
    tag: 'Storytelling',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'die-one-day.jpg',
    sliderVideoMp4: 'die-one-day.mp4',
    sliderVideoWebm: 'die-one-day.webm',
    nextProjectSlug: 'lost-in-mexico',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Die One Day', 'A Story of Mortality'] },
      { type: 'imageBlock', image: 'die-one-day/die-one-day-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Die One Day is a philosophical short film that explores our relationship with mortality and the importance of living fully in the present moment.' },
      { type: 'galleryBlock', images: ['die-one-day/die-one-day-sanshoots--2.jpg', 'die-one-day/die-one-day-sanshoots--3.jpg', 'die-one-day/die-one-day-sanshoots--4.jpg', 'die-one-day/die-one-day-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film challenges viewers to confront their own mortality and use that awareness as motivation to live more intentionally.' },
    ],
  },
  {
    slug: 'lost-in-mexico',
    category: 'shortfilms',
    order: 12,
    title: 'Lost in Mexico',
    tag: 'Travel',
    location: 'Mexico',
    coordinates: '23.6345° N, 102.5528° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'lost-in-mexico.jpg',
    sliderVideoMp4: 'lost-in-mexico.mp4',
    sliderVideoWebm: 'lost-in-mexico.webm',
    nextProjectSlug: 'each-moment-is-a-memory',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Lost in Mexico', 'A Travel Adventure'] },
      { type: 'imageBlock', image: 'lost-in-mexico/lost-in-mexico-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Lost in Mexico is a travel film that captures the vibrant culture, stunning landscapes, and unforgettable experiences of Mexico.' },
      { type: 'galleryBlock', images: ['lost-in-mexico/lost-in-mexico-sanshoots--2.jpg', 'lost-in-mexico/lost-in-mexico-sanshoots--3.jpg', 'lost-in-mexico/lost-in-mexico-sanshoots--4.jpg', 'lost-in-mexico/lost-in-mexico-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This travel film inspires viewers to explore Mexico beyond the tourist trail and discover the authentic beauty of this incredible country.' },
    ],
  },
  {
    slug: 'each-moment-is-a-memory',
    category: 'shortfilms',
    order: 13,
    title: 'Each Moment is a Memory',
    tag: 'Storytelling',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'each-moment-is-a-memory.jpg',
    sliderVideoMp4: 'each-moment-is-a-memory.mp4',
    sliderVideoWebm: 'each-moment-is-a-memory.webm',
    nextProjectSlug: 'embrace-your-journey',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Each Moment is a Memory', 'The Art of Remembering'] },
      { type: 'imageBlock', image: 'each-moment-is-a-memory/each-moment-is-a-memory-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Each Moment is a Memory is a reflective short film about the power of memory and how the moments we capture become the stories we tell.' },
      { type: 'galleryBlock', images: ['each-moment-is-a-memory/each-moment-is-a-memory-sanshoots--2.jpg', 'each-moment-is-a-memory/each-moment-is-a-memory-sanshoots--3.jpg', 'each-moment-is-a-memory/each-moment-is-a-memory-sanshoots--4.jpg', 'each-moment-is-a-memory/each-moment-is-a-memory-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film is a meditation on the importance of being present and the gift of memory that allows us to relive our most cherished moments.' },
    ],
  },
  {
    slug: 'embrace-your-journey',
    category: 'shortfilms',
    order: 14,
    title: 'Embrace Your Journey',
    tag: 'Storytelling',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'embrace-your-journey.jpg',
    sliderVideoMp4: 'embrace-your-journey.mp4',
    sliderVideoWebm: 'embrace-your-journey.webm',
    nextProjectSlug: 'never-let-you-fall',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Embrace Your Journey', 'A Story of Growth'] },
      { type: 'imageBlock', image: 'embrace-your-journey/embrace-your-journey-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Embrace Your Journey is an inspirational short film about personal growth, resilience, and the courage to pursue your dreams despite obstacles.' },
      { type: 'galleryBlock', images: ['embrace-your-journey/embrace-your-journey-sanshoots--2.jpg', 'embrace-your-journey/embrace-your-journey-sanshoots--3.jpg', 'embrace-your-journey/embrace-your-journey-sanshoots--4.jpg', 'embrace-your-journey/embrace-your-journey-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film has inspired countless viewers to embrace their own unique journeys and find strength in their personal stories.' },
    ],
  },
  {
    slug: 'never-let-you-fall',
    category: 'shortfilms',
    order: 15,
    title: 'Never Let You Fall',
    tag: 'Cinematic',
    location: 'Los Angeles, CA, USA',
    coordinates: '34.0522° N, 118.2437° W',
    vimeoUrl: 'https://vimeo.com/988666899',
    posterImage: 'never-let-you-fall.jpg',
    sliderVideoMp4: 'never-let-you-fall.mp4',
    sliderVideoWebm: 'never-let-you-fall.webm',
    nextProjectSlug: 'palestine-activated',
    pageBuilder: [
      { type: 'titleBlock', headingLines: ['Never Let You Fall', 'A Story of Love and Support'] },
      { type: 'imageBlock', image: 'never-let-you-fall/never-let-you-fall-sanshoots--1.jpg' },
      { type: 'paragraphBlock', heading: 'Telling the story', text: 'Never Let You Fall is a cinematic short film about the bonds of friendship and love that carry us through life\'s most challenging moments.' },
      { type: 'galleryBlock', images: ['never-let-you-fall/never-let-you-fall-sanshoots--2.jpg', 'never-let-you-fall/never-let-you-fall-sanshoots--3.jpg', 'never-let-you-fall/never-let-you-fall-sanshoots--4.jpg', 'never-let-you-fall/never-let-you-fall-sanshoots--5.jpg'] },
      { type: 'paragraphBlock', heading: 'In conclusion', text: 'This film is a heartfelt tribute to the people in our lives who lift us up and remind us that we are never alone.' },
    ],
  },
]

// ─── Helper: resolve actual image paths from gallery image references ─────────
async function resolvePageBuilder(pageBuilder) {
  const resolved = []
  for (const block of pageBuilder) {
    if (block.type === 'titleBlock') {
      resolved.push({
        _type: 'titleBlock',
        _key: Math.random().toString(36).slice(2),
        headingLines: block.headingLines,
      })
    } else if (block.type === 'imageBlock') {
      const img = await uploadImage(block.image)
      resolved.push({
        _type: 'imageBlock',
        _key: Math.random().toString(36).slice(2),
        image: img,
        alt: '',
      })
    } else if (block.type === 'imageTextBlock') {
      const img = await uploadImage(block.image)
      resolved.push({
        _type: 'imageTextBlock',
        _key: Math.random().toString(36).slice(2),
        image: img,
        heading: block.heading,
        text: block.text,
      })
    } else if (block.type === 'galleryBlock') {
      const images = []
      for (const imgPath of block.images) {
        const img = await uploadImage(imgPath)
        if (img) {
          images.push({ ...img, _key: Math.random().toString(36).slice(2) })
        }
      }
      resolved.push({
        _type: 'galleryBlock',
        _key: Math.random().toString(36).slice(2),
        images,
      })
    } else if (block.type === 'paragraphBlock') {
      resolved.push({
        _type: 'paragraphBlock',
        _key: Math.random().toString(36).slice(2),
        heading: block.heading,
        text: block.text,
      })
    } else if (block.type === 'reelBlock') {
      resolved.push({
        _type: 'reelBlock',
        _key: Math.random().toString(36).slice(2),
        reelUrl: block.reelUrl,
        useExtraSmall: block.useExtraSmall !== false,
      })
    }
  }
  return resolved
}

// ─── Main migration ───────────────────────────────────────────────────────────
async function migrate() {
  console.log('🚀 Starting SANSHOOTS migration to Sanity...\n')

  // Step 1: Create all project documents (first pass, without nextProject refs)
  const slugToId = {}
  const projectDocs = []

  for (const p of PROJECTS) {
    console.log(`\n📽  Processing: ${p.title} (${p.category})`)

    // Upload poster image
    const posterImage = p.posterImage ? await uploadImage(p.posterImage) : null

    // Upload slider videos
    const sliderVideoMp4 = p.sliderVideoMp4 ? await uploadVideo(p.sliderVideoMp4) : null
    const sliderVideoWebm = p.sliderVideoWebm ? await uploadVideo(p.sliderVideoWebm) : null

    // Resolve page builder blocks
    const pageBuilder = await resolvePageBuilder(p.pageBuilder)

    const doc = {
      _id: `project-${p.slug}`,
      _type: 'project',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      category: p.category,
      tag: p.tag,
      order: p.order,
      location: p.location,
      coordinates: p.coordinates,
      vimeoUrl: p.vimeoUrl,
      posterImage,
      sliderVideoMp4,
      sliderVideoWebm,
      pageBuilder,
    }

    slugToId[p.slug] = `project-${p.slug}`
    projectDocs.push({ doc, nextProjectSlug: p.nextProjectSlug })
  }

  // Step 2: Upsert all project documents WITHOUT nextProject refs first
  console.log('\n\n📝 Upserting project documents (pass 1 - no cross-refs)...')
  for (const { doc } of projectDocs) {
    const docWithoutRef = { ...doc }
    delete docWithoutRef.nextProject
    await client.createOrReplace(docWithoutRef)
    console.log(`  ✓ ${doc.title}`)
  }

  // Step 2b: Patch nextProject references now that all docs exist
  console.log('\n📝 Patching nextProject references (pass 2)...')
  for (const { doc, nextProjectSlug } of projectDocs) {
    if (nextProjectSlug && slugToId[nextProjectSlug]) {
      await client
        .patch(doc._id)
        .set({ nextProject: { _type: 'reference', _ref: slugToId[nextProjectSlug] } })
        .commit()
      console.log(`  ✓ ${doc.title} → ${nextProjectSlug}`)
    }
  }

  // Step 3: Create siteSettings singleton
  console.log('\n📝 Creating siteSettings...')
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'SANSHOOTS®',
    description: 'SANSHOOTS® is an award-winning videography studio founded by Hassan Musa based in Los Angeles, CA.',
    copyright: '©2024',
  })
  console.log('  ✓ siteSettings')

  // Step 4: Create homePage singleton
  console.log('\n📝 Creating homePage...')
  // Upload hero video from static folder
  const heroVidPath = path.resolve(GATSBY_ROOT, '../static/hero-vid.mp4')
  const heroVidRef = await uploadFile(heroVidPath, 'file')
  const heroVideoMp4 = heroVidRef ? { _type: 'file', asset: heroVidRef } : null
  // Upload service videos
  const preProductionVideo = await uploadVideo('pre-production.mp4')
  const productionVideo = await uploadVideo('production.mp4')
  const postProductionVideo = await uploadVideo('post-production.mp4')

  const homeSliderSlugs = ['elyanna', 'yung-bans', 'paliroots', 'palestine-will-be', 'chaos-to-calm', 'tesla-cybertruck']
  await client.createOrReplace({
    _id: 'homePage',
    _type: 'homePage',
    heroVideoMp4,
    sliderProjects: homeSliderSlugs.map((slug) => ({
      _type: 'reference',
      _ref: `project-${slug}`,
      _key: Math.random().toString(36).slice(2),
    })),
    services: [
      { _key: 'pre', name: 'PRE-PRODUCTION', video: preProductionVideo },
      { _key: 'prod', name: 'PRODUCTION', video: productionVideo },
      { _key: 'post', name: 'POST-PRODUCTION', video: postProductionVideo },
    ],
  })
  console.log('  ✓ homePage')

  // Step 5: Create aboutPage singleton
  console.log('\n📝 Creating aboutPage...')
  const aboutVideo = await uploadVideo('post-production.mp4')
  const targetImageDesktop = await uploadImage('target-desktop.png')
  const targetImageMobile = await uploadImage('target-mobile.png')
  const bottomImage = await uploadImage('san-about.jpg')
  await client.createOrReplace({
    _id: 'aboutPage',
    _type: 'aboutPage',
    headline: 'One part left brain, one part right brain. One whole creative video agency.',
    subheadline: 'About Sanshoots',
    aboutVideo,
    targetImageDesktop,
    targetImageMobile,
    bottomImage,
    contactBannerText: 'Get in touch',
  })
  console.log('  ✓ aboutPage')

  // Step 6: Create contactPage singleton
  console.log('\n📝 Creating contactPage...')
  await client.createOrReplace({
    _id: 'contactPage',
    _type: 'contactPage',
    typeformUrl: 'https://form.typeform.com/to/LsunBzR3',
  })
  console.log('  ✓ contactPage')

  // Step 7: Create showreelPage singleton
  console.log('\n📝 Creating showreelPage...')
  const showreelSlugs = PROJECTS.filter((p) => p.category === 'showreel').map((p) => p.slug)
  await client.createOrReplace({
    _id: 'showreelPage',
    _type: 'showreelPage',
    pageTitle: 'Showreel',
    projects: showreelSlugs.map((slug) => ({
      _type: 'reference',
      _ref: `project-${slug}`,
      _key: Math.random().toString(36).slice(2),
    })),
  })
  console.log('  ✓ showreelPage')

  // Step 8: Create shortfilmsPage singleton
  console.log('\n📝 Creating shortfilmsPage...')
  const shortfilmSlugs = PROJECTS.filter((p) => p.category === 'shortfilms').map((p) => p.slug)
  await client.createOrReplace({
    _id: 'shortfilmsPage',
    _type: 'shortfilmsPage',
    pageTitle: 'Shortfilms',
    projects: shortfilmSlugs.map((slug) => ({
      _type: 'reference',
      _ref: `project-${slug}`,
      _key: Math.random().toString(36).slice(2),
    })),
  })
  console.log('  ✓ shortfilmsPage')

  console.log('\n\n✅ Migration complete!')
  console.log(`   ${PROJECTS.length} projects migrated`)
  console.log('   Singletons: siteSettings, homePage, aboutPage, contactPage, showreelPage, shortfilmsPage')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
