import { supabaseCount } from "../../../lib/supabase";

const allowedPageSizes = [10, 25, 50, 100];

export function getPagination(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const requested = Number(url.searchParams.get("perPage") || 25) || 25;
  const perPage = allowedPageSizes.includes(requested) ? requested : 25;
  const offset = (page - 1) * perPage;
  return { page, perPage, offset };
}

export async function pagedQuery(tablePath: string, countPath: string, request: Request) {
  const { page, perPage, offset } = getPagination(request);
  const total = await supabaseCount(countPath);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pagePath = `${tablePath}&limit=${perPage}&offset=${offset}`;
  return {
    pagePath,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total),
    },
  };
}
