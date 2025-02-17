import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('generalStore', {
  state: () => ({
    websiteName: 'DJH Playground',
    description: `This is just a small website showing some minimal, simple UI prototypes using Vue, Nuxt, Nuxt UI v3, Tailwind 4 and Pinia.
      There is no backend`,
    disclaimer: `Just a bit of a disclaimer here: these are not meant to be robust, fully-functional components.
      They are merely prototypes to display components that could be useful if properly implemented into an existing web app.`,
    calendarDescription: `A simple calendar component that allows the user to create events that are tagged for easy visual
      feedback. A bit of reinventing the wheel, but I think the tag aspect makes it unique. Could be useful as an alternate
      view if the data is imported from another calendar app.`,
  }),
})
