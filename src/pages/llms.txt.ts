import type { APIRoute } from 'astro';
import { renderLlmsTxt } from '../seo/llms-copy';

export const GET: APIRoute = () => {
  return new Response(renderLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
