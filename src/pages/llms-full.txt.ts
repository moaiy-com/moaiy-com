import type { APIRoute } from 'astro';
import { renderLlmsFullTxt } from '../seo/llms-copy';

export const GET: APIRoute = () => {
  return new Response(renderLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
