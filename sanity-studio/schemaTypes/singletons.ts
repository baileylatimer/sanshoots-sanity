import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      initialValue: 'SANSHOOTS®',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      initialValue:
        'SANSHOOTS® is an award-winning videography studio founded by Hassan Musa based in Los Angeles, CA.',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright Text',
      type: 'string',
      initialValue: '©2024',
    }),
  ],
})

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVideoMp4',
      title: 'Hero Background Video (MP4)',
      type: 'file',
      description: 'The full-screen background video on the hero section.',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'sliderProjects',
      title: 'Featured Slider Projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      description: 'Projects shown in the home page video slider (in order).',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'service',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({
              name: 'video',
              title: 'Video',
              type: 'file',
              options: {accept: 'video/mp4'},
            }),
          ],
          preview: {
            select: {name: 'name'},
            prepare({name}: {name: string}) {
              return {title: name}
            },
          },
        },
      ],
      description: 'The three service items (Pre-Production, Production, Post-Production).',
    }),
  ],
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'One part left brain, one part right brain. One whole creative video agency.',
    }),
    defineField({
      name: 'subheadline',
      title: 'Sub-headline',
      type: 'string',
      initialValue: 'About Sanshoots',
    }),
    defineField({
      name: 'aboutVideo',
      title: 'About Video',
      type: 'file',
      description: 'The video shown in the about card / reel section.',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'targetImageDesktop',
      title: 'Target Image (Desktop)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'targetImageMobile',
      title: 'Target Image (Mobile)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bottomImage',
      title: 'Bottom Full-Width Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'contactBannerText',
      title: 'Contact Banner Text',
      type: 'string',
      initialValue: 'Get in touch',
    }),
  ],
})

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  fields: [
    defineField({
      name: 'typeformUrl',
      title: 'Typeform URL',
      type: 'url',
      description: 'The Typeform embed URL for the contact form.',
      initialValue: 'https://form.typeform.com/to/LsunBzR3',
    }),
  ],
})

export const showreelPage = defineType({
  name: 'showreelPage',
  title: 'Showreel Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Showreel',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      description: 'Showreel projects shown in the slider (in order). Leave empty to auto-show all showreel projects.',
    }),
  ],
})

export const shortfilmsPage = defineType({
  name: 'shortfilmsPage',
  title: 'Shortfilms Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Shortfilms',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      description: 'Shortfilm projects shown in the slider (in order). Leave empty to auto-show all shortfilm projects.',
    }),
  ],
})
