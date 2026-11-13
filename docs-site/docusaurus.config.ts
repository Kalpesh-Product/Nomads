import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'WONO Nomads',
  tagline: 'User guide for the WONO Nomad platform',
  url: 'https://wono.co',
  baseUrl: '/docs/',
  trailingSlash: true,
  favicon: 'img/wono-favicon.png',
  onBrokenLinks: 'throw',
  future: {
    faster: {swcHtmlMinimizer: false},
  },
  presets: [
    [
      'classic',
      {
        docs: {routeBasePath: '/', sidebarPath: './sidebars.ts'},
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {hashed: true, indexBlog: false, docsRouteBasePath: '/'},
    ],
  ],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      logo: {alt: 'WONO', src: 'img/wono.svg', srcDark: 'img/wono-dark.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'nomadsSidebar', label: 'User Guide', position: 'left'},
        {href: 'https://wono.co', label: 'Back to WONO', position: 'right'},
      ],
    },
    footer: {
      links: [
        {label: 'User Guide', to: '/'},
        {label: 'Contact WONO', href: 'https://wono.co/contact'},
        {label: 'Host Panel Docs', href: 'https://hostpanel.wono.co/docs/'},
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
