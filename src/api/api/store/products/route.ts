import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// /api/store/products - get all products
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const productService = req.scope.resolve(Modules.PRODUCT);

  try {
    const { limit = 50, offset = 0, q, status } = req.query;

    // build filters for admin access (includes draft products)
    const filters: any = {};
    if (q) filters.title = { $ilike: `%${q}%` };
    if (status) filters.status = status;

    // get products with all admin relations
    const [products, count] = await productService.listAndCountProducts(
      filters,
      {
        relations: [
          "variants",
          "images",
          "tags",
          "categories",
          "collection",
          "type",
        ],
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }
    );

    res.json({
      products,
      count,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch products",
    });
  }
}
