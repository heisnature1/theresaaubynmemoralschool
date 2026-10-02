import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // The school colours, taken from the crest.
        teresa: {
          green: {
            50: '#eef8f3',
            100: '#d5eee1',
            200: '#aedec7',
            300: '#79c6a5',
            400: '#46a881',
            500: '#238b64',
            600: '#166f4f',
            700: '#115940',
            800: '#0d4734',
            900: '#09392a',
            950: '#052118',
          },
          gold: {
            50: '#fbf8eb',
            100: '#f6eecb',
            200: '#eedc99',
            300: '#e4c45e',
            400: '#d9af37',
            500: '#c79626',
            600: '#aa741d',
            700: '#88561b',
            800: '#72451d',
            900: '#623b1e',
            950: '#381e0e',
          },
          ivory: '#FAF8F3',
          parchment: '#F3EFE4',
        },
      },
      fontFamily: {
        // Georgia is present on every school computer; the site does without webfonts.
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
