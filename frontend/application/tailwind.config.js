module.exports = {
  // Paths need to be relative from frontend-folder
  purge: [
    '../craft/templates/**/*.twig',
    './application/src/**/*.vue',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
