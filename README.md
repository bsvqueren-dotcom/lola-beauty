# Lola Beauty — website

Static website for **Lola Beauty** (Makeup · Hair · Bridal · Brows), on-location in Charlotte, NC & SC.
Live domain: **https://lolabeautycharlotte.com/**

Three languages: English (`/`), Português (`/pt/`) and Español (`/es/`), with one page per service.

- Pure HTML + CSS + JS. No build step, no dependencies.
- Images in WebP with mobile versions; videos load only when visible.
- SEO and AI ready: `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD on every page, hreflang between languages.

## Publish with GitHub Pages
1. Push this folder to a GitHub repository (branch `main`).
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
3. The `CNAME` file already sets the custom domain `lolabeautycharlotte.com`. At your domain provider, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `<your-github-user>.github.io`
4. Back in **Settings → Pages**, tick **Enforce HTTPS** once the certificate is ready.
