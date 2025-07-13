import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveProductsWorkflow } from "../../../../workflows/products/retrieve";

// /store/products/retrieve/ - retrieve all products
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { order, skip = 0, take = 50, q, id, random } = req.query;
    const orderObj = JSON.parse((order as string) || "{}");

    const skipNum = parseInt(skip as string) || 0;
    const takeNum = parseInt(take as string) || 50;

    const service = req.scope.resolve("product");
    const [, count] = await service.listAndCountProducts();

    const maxSkip = Math.max(count - takeNum, 0);
    const randomSkip = Math.floor(Math.random() * (maxSkip + 1));

    // build filters
    const filters: any = { status: "published" };
    if (q) filters.title = { $ilike: `%${q}%` };
    if (id) filters.id = id;

    const { result: products } = await retrieveProductsWorkflow(req.scope).run({
      input: {
        filters,
        order: orderObj,
        skip: random ? randomSkip : skipNum,
        take: takeNum,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error retriving products:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve products",
    });
  }
}
