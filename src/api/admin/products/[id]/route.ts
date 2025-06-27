import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const productService = req.scope.resolve(Modules.PRODUCT);

  try {
    const { id } = req.params;

    const product = await productService.retrieveProduct(id, {
      relations: [
        "variants",
        "images",
        "tags",
        "categories",
        "collection",
        "type",
      ],
    });

    if (!product) {
      res.status(404).json({
        error: "Product not found",
        message: `Product with id ${id} does not exist`,
      });
    }

    res.json({ product: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch product",
    });
  }
}
