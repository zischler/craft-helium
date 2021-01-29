module.exports = {
  // Paths need to be relative from frontend-folder
  purge: [
    '../craft/templates/**/*.twig',
    './application/src/**/*.vue',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'sans': ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      'serif': ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
    },
    extend: {
      flex: {
        '1of1': '0 1 100%',
        '1of2': '0 1 50%',
        '1of3': '0 1 33.33%',
        '2of3': '0 1 66.66%',
        '1of4': '0 1 25%',
        '2of4': '0 1 50%',
        '3of4': '0 1 75%',
        '1of5': '0 1 20%',
        '2of5': '0 1 40%',
        '3of5': '0 1 60%',
        '4of5': '0 1 80%',
        '1of6': '0 1 16.66%',
        '2of6': '0 1 33.33%',
        '3of6': '0 1 49.99%',
        '4of6': '0 1 66.66%',
        '5of6': '0 1 83.33%',
      },
      maxWidth: {
        'screen': '100vw',
      },
      maxHeight: {
        'screen': '100vh',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
