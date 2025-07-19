import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// /admin/brands/ - all brands
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { q, id } = req.query;
  const query = req.scope.resolve("query");

  // build filters
  const filters: Record<string, any> = {};
  if (id) filters.id = id;
  if (q) filters.name = { $like: `%${q}%` };

  const { data: brands, metadata: { count, take, skip } = {} } =
    await query.graph({
      entity: "brand",
      ...req.queryConfig,
      filters,
    });

  res.json({
    brands,
    count,
    limit: take,
    offset: skip,
  });
}
