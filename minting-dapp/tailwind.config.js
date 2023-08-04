const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.tsx',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // General
        page: {
          from_bg: colors.red[500],
          to_bg: colors.red[500],
        },
        titles: colors.red[500],
        links: {
          txt: colors.white[000],
          hover_txt: colors.red[500],
        },
        loading_spinner: colors.red[500],
        popups: {
          bg: colors.transparent[000],
          txt: colors.red[500],
          internal_border: colors.red[500],
        },
        warning: {
          txt: colors.white[000],
          bg: colors.transparent[000],
          border: colors.red[500],
        },
        error: {
          txt: colors.red[500],
          bg: colors.black[000],
          border: colors.red[500],
        },

        // Inputs
        btn: {
          txt: colors.red[500],
          bg: colors.transparent[000],
          border: colors.red[500],
          hover_txt: colors.white,
          hover_bg: colors.red[500],
          hover_border: colors.red[500],
        },
        btn_primary: {
          txt: colors.red[500],
          bg: colors.transparent[000],
          border: colors.red[500],
          hover_txt: colors.white,
          hover_bg: colors.red[500],
          hover_border: colors.red[500],
        },
        btn_error: {
          txt: colors.white[000],
          bg: colors.transparent[000],
          border: colors.red[500],
          hover_txt: colors.white,
          hover_bg: colors.red[500],
          hover_border: colors.red[500],
        },
        label: colors.transparent[000],
        txt_input: {
          txt: colors.red[500],
          bg: colors.transparent,
          border: colors.red[500],
          focus_txt: colors.red[500],
          focus_bg: colors.transparent,
          focus_border: colors.red[500],
          placeholder_txt: colors.red[500],
        },
        
        // Whitelist proof widget
        wl_message: {
          txt: colors.white[000],
          bg: colors.transparent[000],
        },

        // Mint widget
        token_preview: colors.transparent[000],
        border: colors.red[500],
      },
    },
  },
  variants: {},
  plugins: [],
};
