import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// /admin/brands/retrieve - all brands
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
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
  } catch (error) {
    console.error("Error retriving brand:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Brand not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve brand",
    });
  }
}
