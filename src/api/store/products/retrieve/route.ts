import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveProductsWorkflow } from "@/workflows/store/product/retrieve";

interface InputType {
  filters?: any;
  order?: any;
  skip?: number;
  take?: number;
  withGraph?: boolean;
}

// /store/products/retrieve/ - retrieve all products
export async function GET(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      order,
      skip = 0,
      take = 25,
      q,
      id,
      random,
      category_id,
      brand_id,
    } = req.query;
    let withGraph: boolean = true;
    const orderObj = JSON.parse((order as string) || "{}");
    const skipNum = parseInt(skip as string) || 0;
    const takeNum = parseInt(take as string) || 25;

    const service = req.scope.resolve("product");
    const [, count] = await service.listAndCountProducts();

    const maxSkip = Math.max(count - takeNum, 0);
    const randomSkip = Math.floor(Math.random() * (maxSkip + 1));

    // build filters
    const filters: Record<string, any> = { status: "published" };
    if (q) filters.title = { $ilike: `%${q}%` };
    if (id) filters.id = id;
    if (category_id) filters.categories = { $eq: category_id };

    // custom models filter
    if (brand_id) filters.brand = { id: brand_id };

    // if (category_id) {
    //   const catIds = (category_id as string).split(",");
    //   filters.categories = { id: { $in: catIds } };
    // }

    const { result: products } = await retrieveProductsWorkflow(req.scope).run({
      input: {
        filters,
        order: orderObj,
        skip: random ? randomSkip : skipNum,
        take: takeNum,
        withGraph,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error retriving products:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Product not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve products",
    });
  }
}
