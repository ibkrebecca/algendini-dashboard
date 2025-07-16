import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { EXTENDED_PRODUCT_CATEGORY_MODULE } from "../../../../modules/product_category";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

// define the request body type
interface UpdateProductCategoryRequest {
  id: string;
  url: string;
}

// /store/categories/update_image/ - update category image
export async function POST(
  req: MedusaRequest<UpdateProductCategoryRequest>,
  res: MedusaResponse
): Promise<void> {
  const extendedProductCategoryService = req.scope.resolve(
    EXTENDED_PRODUCT_CATEGORY_MODULE
  );

  const { id, url } = req.body as UpdateProductCategoryRequest;

  // validate required fields
  if (!id || !url) {
    res.status(400).json({
      error: "Bad Request",
      message: "Category id and image url are required",
    });
    return;
  }

  try {
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
    let result;

    try {
      // try to retrieve the extended product category by id
      await extendedProductCategoryService.retrieveExtendedProductCategory(id);

      // if found, update it
      result =
        await extendedProductCategoryService.updateExtendedProductCategories({
          id,
          image: url,
        });
    } catch (error) {
      // if not found, create it
      if (error.type === "not_found") {
        result =
          await extendedProductCategoryService.createExtendedProductCategories({
            id,
            image: url,
          });

        await link.create({
          [Modules.PRODUCT]: { product_category_id: id },
          extended_product_category: {
            extended_product_category_id: id,
          },
        });
      } else {
        throw error;
      }
    }

    res.status(201).json({
      result,
      message: "Added category image",
    });
  } catch (error) {
    console.error("Error updating category image:", error);

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update category image",
    });
  }
}
