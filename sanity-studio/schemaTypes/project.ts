import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Showreel', value: 'showreel'},
          {title: 'Shortfilms', value: 'shortfilms'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'e.g. Event, Music Video, Apparel, Auto, Cinematic, etc.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in the list.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Santa Ana, CA, USA',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
      description: 'e.g. 33.7455° N, 117.8677° W',
    }),
    defineField({
      name: 'projectVideoMp4',
      title: 'Project Video (MP4) — preferred',
      type: 'file',
      description: 'Upload the project hero video directly. If provided, this plays instead of the Vimeo URL.',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo URL (fallback)',
      type: 'url',
      description: 'Vimeo URL used only when no Project Video file is uploaded above.',
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster Image',
      type: 'image',
      description: 'Thumbnail/poster image shown in the slider before video loads.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'sliderVideoMp4',
      title: 'Slider Video (MP4)',
      type: 'file',
      description: 'Short preview clip for the slider (MP4 format).',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'sliderVideoWebm',
      title: 'Slider Video (WebM)',
      type: 'file',
      description: 'Short preview clip for the slider (WebM format for better browser support).',
      options: {accept: 'video/webm'},
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      description: 'Build the horizontal-scroll project page by adding blocks in order.',
      of: [
        {type: 'titleBlock'},
        {type: 'imageBlock'},
        {type: 'imageTextBlock'},
        {type: 'galleryBlock'},
        {type: 'paragraphBlock'},
        {type: 'reelBlock'},
      ],
    }),
    defineField({
      name: 'nextProject',
      title: 'Next Project',
      type: 'reference',
      to: [{type: 'project'}],
      description: 'The project shown in the "Next Project" section at the end of this page.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'posterImage',
    },
    prepare({title, category, media}) {
      return {
        title,
        subtitle: category,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
})
