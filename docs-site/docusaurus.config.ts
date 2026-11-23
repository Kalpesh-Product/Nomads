import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions} from '@docusaurus/plugin-content-docs';


// Categories excluded from sidebar navigation while their URLs stay available.
const HIDDEN_CATEGORY_LABELS = new Set(['Help and policies']);

type SidebarItems = Awaited<
  ReturnType<PluginOptions['sidebarItemsGenerator']>
>;

const withoutHiddenCategories = (items: SidebarItems): SidebarItems =>
  items
    .filter((item) => !(item.type === 'category' && HIDDEN_CATEGORY_LABELS.has(item.label)))
    .map((item) =>
      item.type === 'category'
        ? {...item, items: withoutHiddenCategories(item.items)}
        : item,
    );

// Non-clickable sidebar entries that are announced but not available yet; the
// badge style matches the "Coming soon" pill in the Nomads web app sidebar.
const createComingSoonSidebarItem = (label: string) => ({
  type: 'html' as const,
  className: 'sidebar-coming-soon-item',
  value: `<div class="sidebar-coming-soon"><span>${label}</span><span class="sidebar-coming-soon-badge">Coming soon</span></div>`,
});

const COMING_SOON_AFTER_DOC_ID: Record<string, string> = {
  'destinations/news': 'Restaurants',
  'services/workation': 'Apply for Jobs',
};

const withComingSoonEntries = (items: SidebarItems): SidebarItems =>
  items.map((item) => {
    if (item.type !== 'category') return item;

    const children = withComingSoonEntries(item.items);
    const withEntries: SidebarItems = [];

    for (const child of children) {
      withEntries.push(child);

      if (child.type === 'doc' && COMING_SOON_AFTER_DOC_ID[child.id]) {
        withEntries.push(
          createComingSoonSidebarItem(COMING_SOON_AFTER_DOC_ID[child.id]),
        );
      }
    }

    return {...item, items: withEntries};
  });

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
            return withComingSoonEntries(withoutHiddenCategories(items));
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
