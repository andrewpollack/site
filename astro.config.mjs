// @ts-check
import { defineConfig } from 'astro/config';
import { execSync } from 'child_process';

import sitemap from "@astrojs/sitemap";
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

function getCommitHash() {
  // Cloudflare Pages provides this env var
  if (process.env.CF_PAGES_COMMIT_SHA) {
    return process.env.CF_PAGES_COMMIT_SHA.slice(0, 7);
  }
  // Fallback for local builds
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  site: "https://andrewpollack.dev",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
  vite: {
    define: {
      __COMMIT_HASH__: JSON.stringify(getCommitHash()),
    },
  },
});
