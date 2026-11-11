import type { MetadataRoute } from 'next';
import { abs } from '@/lib/seo';

// Everyone may read the site, AI search crawlers included (OAI-SearchBot, GPTBot, Google-Extended,
// PerplexityBot, ClaudeBot): being quoted in AI answers is part of the plan, see MARKETING-PLAN.md.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/render' },
    sitemap: abs('/sitemap.xml'),
  };
}
