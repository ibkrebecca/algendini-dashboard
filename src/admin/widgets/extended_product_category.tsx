import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  AdminProductCategory,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { Button, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Container as UiContainer } from "@/components/container";
import { FileType, FileUpload } from "@/components/file/file-upload";
import { FilePreview } from "@/components/file/file-preview";
import { Thumbnail } from "@/components/thumbnail";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/config";
import { JsonView } from "@/widgets/json_view";

type AdminProductCategoryExtended = AdminProductCategory & {
  extended_product_category?: {
    image?: string;
  };
};

// the extended product category widget
const ExtendedProductCategoryWidget = ({
  data: category,
}: DetailWidgetProps<AdminProductCategoryExtended>) => {
  const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
  const HEADERS = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLIC_KEY,
  };

  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.productCategory.retrieve(category.id, {
        fields: "+extended_product_category.*",
      }),
    queryKey: [["product_category", category.id]],
  });

  const cat = qr?.product_category as AdminProductCategoryExtended;
  const extended = cat?.extended_product_category;

  const [image, setImage] = useState(extended?.image);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (extended?.image) setImage(extended.image);
  }, [extended?.image]);

  const onImageChange = (files: FileType[]) => {
    if (files.length > 0) setFile(files[0].file);
  };

  const onImageUpload = async () => {
    if (!file) {
      toast.error("Error", {
        description: "Image URL is required.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${import.meta.env.VITE_STORE_URL}/store/uploads/single_image`,
        {
          method: "POST",
          headers: {
            "x-publishable-api-key": PUBLIC_KEY,
          },
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      const url = data.url;
      await onUpdate(url);
    } catch {
      toast.error("Error", {
        description: "Failed to save the image.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onUpdate = async (image_url: string) => {
    try {
      await sdk.client.fetch("/store/categories/update_image", {
        method: "POST",
        headers: HEADERS,
        body: { id: category.id, url: image_url },
      });

      setImage(image_url);
      setFile(null);
      toast.success("Success", {
        description: "Category image added.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update category image.",
      });
    }
  };

  return (
    <>
      <UiContainer>
        <Header title="Image" />

        <div className="flex flex-col gap-y-4 px-6 py-4">
          <FileUpload
            label="Category Image"
            hint="select category image"
            formats={["jpg", "jpeg", "png", "webp"]}
            multiple={false}
            onUploaded={onImageChange}
          />

          {(image || file) && (
            <div className="flex items-center gap-x-5">
              {image && (
                <Thumbnail src={image} alt="category image" size="large" />
              )}

              <FilePreview
                className="w-full"
                filename="category image file"
                url={image ?? file?.name}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onImageUpload} disabled={saving || !file}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </UiContainer>

      <JsonView data={extended || {}} title="EXTENDED JSON" />
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default ExtendedProductCategoryWidget;
