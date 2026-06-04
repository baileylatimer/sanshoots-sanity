import {defineField, defineType} from 'sanity'

export const titleBlock = defineType({
  name: 'titleBlock',
  title: 'Title Block',
  type: 'object',
  fields: [
    defineField({
      name: 'headingLines',
      title: 'Heading Lines',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Each string is a separate line of the heading (rendered with <br> between them).',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {lines: 'headingLines'},
    prepare({lines}) {
      return {title: 'Title Block', subtitle: lines?.join(' / ')}
    },
  },
})

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
    }),
  ],
  preview: {
    select: {media: 'image', alt: 'alt'},
    prepare({media, alt}) {
      return {title: 'Image Block', subtitle: alt, media}
    },
  },
})

export const imageTextBlock = defineType({
  name: 'imageTextBlock',
  title: 'Image + Text Block',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {heading: 'heading', media: 'image'},
    prepare({heading, media}) {
      return {title: 'Image + Text Block', subtitle: heading, media}
    },
  },
})

export const galleryBlock = defineType({
  name: 'galleryBlock',
  title: 'Gallery Block',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
        },
      ],
      description: 'Exactly 4 images for the 2-column gallery layout.',
      validation: (Rule) => Rule.required().min(4).max(4),
    }),
  ],
  preview: {
    select: {images: 'images'},
    prepare({images}) {
      return {title: 'Gallery Block', subtitle: `${images?.length || 0} images`, media: images?.[0]}
    },
  },
})

export const paragraphBlock = defineType({
  name: 'paragraphBlock',
  title: 'Paragraph Block',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {heading: 'heading', text: 'text'},
    prepare({heading, text}) {
      return {title: 'Paragraph Block', subtitle: heading || text?.substring(0, 60)}
    },
  },
})

export const reelBlock = defineType({
  name: 'reelBlock',
  title: 'Reel Block',
  type: 'object',
  fields: [
    defineField({
      name: 'reelUrl',
      title: 'Reel URL',
      type: 'url',
      description: 'Vimeo URL for an embedded reel/video within the project page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'useExtraSmall',
      title: 'Use Extra Small Width',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {reelUrl: 'reelUrl'},
    prepare({reelUrl}) {
      return {title: 'Reel Block', subtitle: reelUrl}
    },
  },
})
