import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const modules = import.meta.glob("./blog/*.md", { eager: true });
  const posts = Object.values(modules) as any[];

  posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );

  return rss({
    title: "Andrew Pollack-Gray's Blog",
    description:
      "Build systems, infrastructure, CI/CD, and the invisible mechanics of developer productivity.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.frontmatter.title,
      pubDate: new Date(post.frontmatter.date),
      link: post.url,
      description: post.frontmatter.description,
    })),
  });
}
