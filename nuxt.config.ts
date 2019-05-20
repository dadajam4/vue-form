import NuxtConfiguration from '@nuxt/config';

const config: NuxtConfiguration = {
  srcDir: 'src/',

  generate: {
    dir: 'docs',
  },

  router: {
    linkActiveClass: 'is-active',
  },
  head: {
    titleTemplate: titleChunk => {
      return titleChunk ? `${titleChunk} - VueForm` : 'VueForm';
    },
  },

  css: [
    '@fortawesome/fontawesome-free-webfonts',
    '@fortawesome/fontawesome-free-webfonts/css/fa-brands.css',
    '@fortawesome/fontawesome-free-webfonts/css/fa-regular.css',
    '@fortawesome/fontawesome-free-webfonts/css/fa-solid.css',
    'bulma',
  ],

  plugins: ['~/plugins/lib'],
};

export default config;
