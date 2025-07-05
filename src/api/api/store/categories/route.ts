import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// /api/store/categories - get all categories
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const productService = req.scope.resolve(Modules.PRODUCT);

  try {
    const { limit = 50, offset = 0, q, is_active, is_internal } = req.query;

    // build filters for admin access
    const filters: any = {};
    if (q) filters.name = { $ilike: `%${q}%` };
    if (is_active !== undefined) filters.is_active = is_active === "true";
    if (is_internal !== undefined) filters.is_internal = is_internal === "true";

    // get categories with relations
    const [categories, count] =
      await productService.listAndCountProductCategories(filters, {
        relations: ["parent_category", "category_children", "products"],
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

    res.json({
      categories,
      count,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch categories",
    });
  }
}
