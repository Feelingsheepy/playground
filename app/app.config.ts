export default defineAppConfig({
  // https://ui3.nuxt.dev/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'zinc',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    },
    toaster: {
      defaultVariants: {
        position: 'bottom-right',
        duration: 2000
      }
    }
  }
})
