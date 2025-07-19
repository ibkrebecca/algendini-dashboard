import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import {
  Button,
  Drawer,
  Label,
  Prompt,
  toast,
  Text,
  Select,
} from "@medusajs/ui";
import { useState } from "react";
import { Header } from "@/components/header";
import { Container as UiContainer } from "@/components/container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/config";
import { PencilSquare, Trash } from "@medusajs/icons";

type Brand = {
  id: string;
  name: string;
};

type BrandsResponse = {
  brands: Brand[];
  count: number;
  limit: number;
  offset: number;
};

type AdminProductBrand = AdminProduct & {
  brand?: Brand;
};

const BrandWidget = ({
  data: product,
}: DetailWidgetProps<AdminProductBrand>) => {
  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+brand.*",
      }),
    queryKey: [["product_brand", product.id]],
  });

  const { data: brands } = useQuery<BrandsResponse>({
    queryKey: ["brands"],
    queryFn: () => sdk.client.fetch("/admin/brands/retrieve"),
  });

  const prod = qr?.product as AdminProductBrand;
  const brand = prod?.brand;

  const queryClient = useQueryClient();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    undefined
  );
  const [saving, setSaving] = useState(false);
  const [brandDelete, setBrandDelete] = useState<boolean>(false);
  const [brandEdit, setBrandEdit] = useState<boolean>(false);

  const onBrandUpdate = async (isRemove = false) => {
    setSaving(true);

    const old_brand_id: string = brand?.id ?? "null";
    const brand_id: string = isRemove ? old_brand_id : selectedBrand!;
    const is_remove: string = isRemove ? "true" : "false";

    try {
      await sdk.client.fetch(`/admin/brands/product`, {
        method: "POST",
        body: {
          brand_id: brand_id,
          old_brand_id: old_brand_id,
          product_id: product.id,
          is_remove: is_remove,
        },
        credentials: "include",
      });

      toast.success("Success", {
        description: "Brand updated.",
      });
    } catch (error) {
      console.log(error);

      toast.error("Error", {
        description: "Failed to update brand.",
      });
    } finally {
      onClean();
    }
  };

  const onClean = () => {
    queryClient.invalidateQueries({ queryKey: [["product_brand"]] });

    setSelectedBrand(undefined);
    setSaving(false);
    setBrandEdit(false);
    setBrandDelete(false);
  };

  return (
    <>
      <UiContainer className="pb-4">
        <Header
          title="Brand"
          actions={[
            {
              type: "action-menu",
              props: {
                groups: [
                  {
                    actions: [
                      {
                        icon: <PencilSquare />,
                        label: "Edit",
                        onClick: () => setBrandEdit(!brandEdit),
                      },
                      {
                        icon: <Trash />,
                        label: "Remove",
                        disabled: brand === undefined,
                        onClick: () => setBrandDelete(!brandDelete),
                      },
                    ],
                  },
                ],
              },
            },
          ]}
        />

        <div className="flex h-full flex-col px-6 py-4">
          <div className="text-ui-fg-subtle grid grid-cols-2 items-center">
            <Text size="small" weight="plus" leading="compact">
              Name
            </Text>

            <Text
              size="small"
              leading="compact"
              className="whitespace-pre-line text-pretty"
            >
              {brand?.name || "-"}
            </Text>
          </div>
        </div>
      </UiContainer>

      {/*  delete */}
      <Prompt open={brandDelete} onOpenChange={() => setBrandDelete(false)}>
        <Prompt.Trigger asChild />
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Are you sure?</Prompt.Title>

            <Prompt.Description>
              You are about to remove product brand.
            </Prompt.Description>
          </Prompt.Header>

          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={() => onBrandUpdate(true)}>
              Delete
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      {/* brand edit  */}
      <Drawer open={brandEdit} onOpenChange={() => setBrandEdit(false)}>
        <Drawer.Trigger asChild />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Brand</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-y-4 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-x-1">
                <Label size="small" weight="plus">
                  Brand
                </Label>
              </div>

              <Select
                value={selectedBrand || brand?.id || undefined}
                onValueChange={setSelectedBrand}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select a brand..." />
                </Select.Trigger>

                <Select.Content>
                  {brands?.brands.map((brand) => (
                    <Select.Item key={brand.id} value={brand.id}>
                      {brand.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Drawer.Close>

            <Button
              onClick={() => onBrandUpdate()}
              disabled={saving || !selectedBrand}
            >
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default BrandWidget;
