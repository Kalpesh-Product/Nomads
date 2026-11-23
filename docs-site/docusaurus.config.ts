import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions} from '@docusaurus/plugin-content-docs';


// Docs that stay online but are left out of the sidebar navigation.
const HIDDEN_DOC_IDS = new Set(['destinations/browse-listings']);

type SidebarItems = Awaited<
  ReturnType<PluginOptions['sidebarItemsGenerator']>
>;

const withoutHiddenDocs = (items: SidebarItems): SidebarItems =>
  items
    .filter((item) => !(item.type === 'doc' && HIDDEN_DOC_IDS.has(item.id)))
    .map((item) =>
      item.type === 'category'
        ? {...item, items: withoutHiddenDocs(item.items)}
        : item,
    );

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
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          async sidebarItemsGenerator(args) {
            const items = await args.defaultSidebarItemsGenerator(args);
            return withoutHiddenDocs(items);
          },
        },
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
