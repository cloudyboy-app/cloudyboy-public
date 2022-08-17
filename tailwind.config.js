/* eslint-disable @typescript-eslint/no-var-requires */

const customColors = {
  secondary: '#345c34',
  accent: '#0f380e'
};

module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          ...customColors,
          primary: '#bae111'
        },
        dark: {
          ...require('daisyui/src/colors/themes')['[data-theme=dark]'],
          ...customColors,
          primary: '#9bbb0e'
        }
      }
    ]
  },
  safelist: ['alert-info', 'alert-success', 'alert-warning', 'alert-error']
};
