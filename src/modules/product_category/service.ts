// src/modules/product_category/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { ExtendedProductCategory } from "./models/extend";

class ExtendedProductCategoryService extends MedusaService({
  ExtendedProductCategory,
}) {
  // custom method to get extended product category with error handling
  async getExtendedProductCategorySafely(id: string) {
    try {
      return await this.retrieveExtendedProductCategory(id);
    } catch (error) {
      if (error.type === "not_found") {
        return null;
      }
      throw error;
    }
  }
}

export default ExtendedProductCategoryService;
