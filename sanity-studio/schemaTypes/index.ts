import {project} from './project'
import {titleBlock, imageBlock, imageTextBlock, galleryBlock, paragraphBlock, reelBlock} from './pageBlocks'
import {siteSettings, homePage, aboutPage, contactPage, showreelPage, shortfilmsPage} from './singletons'

export const schemaTypes = [
  // Documents
  project,
  // Page builder blocks (objects)
  titleBlock,
  imageBlock,
  imageTextBlock,
  galleryBlock,
  paragraphBlock,
  reelBlock,
  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  contactPage,
  showreelPage,
  shortfilmsPage,
]
