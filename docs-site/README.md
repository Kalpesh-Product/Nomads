# WONO Nomads documentation

This Docusaurus site contains the public Nomad user guide. It follows the Host Panel docs setup, with a sidebar, local search and light and dark themes.

Use Node.js 20 or later. From this directory:

```sh
npm ci
npm start
```

Open [the local guide](http://localhost:3000/docs/). Edit the Markdown files in `docs/`; the sidebar uses folder metadata and each page's `sidebar_position`. Screenshots and brand assets live in `static/img/`.

```sh
npm run typecheck
npm run build
npm run serve
```

The production build goes to `build/`. The Nomads deploy workflow copies that output into `frontend/dist/docs/` before uploading the frontend. The web server should serve directory indexes under `/docs/` and return the docs 404 for missing pages rather than falling back to the Nomads SPA.

If the Nomads Nginx server uses the frontend build as its document root, this location can sit alongside the existing SPA rule:

```nginx
location ^~ /docs/ {
    index index.html;
    try_files $uri $uri/ =404;
    error_page 404 /docs/404.html;
}
```
