import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import {
  Button,
  Drawer,
  DropdownMenu,
  IconButton,
  Input,
  Label,
  Prompt,
  Table,
  toast,
  Text,
  Select,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Container as UiContainer } from "@/components/container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/config";
import { JsonView } from "@/widgets/json_view";
import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";

type Feature = {
  title: string;
  value: string;
};

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

type AdminProductExtended = AdminProduct & {
  extended_product?: {
    view_count?: number;
    features?: Feature[];
    brand?: Brand;
  };
};

// the extended product widget
const ExtendedProductWidget = ({
  data: product,
}: DetailWidgetProps<AdminProductExtended>) => {
  const queryClient = useQueryClient();
  const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
  const HEADERS = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLIC_KEY,
  };

  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+brand.*,+extended_product.*",
      }),
    queryKey: [["product", product.id]],
  });

  const prod = qr?.product as AdminProductExtended;
  const extended = prod?.extended_product;

  const [featureTitle, setFeatureTitle] = useState("");
  const [featureValue, setFeatureValue] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    undefined
  );
  const [features, setFeatures] = useState<Feature[]>([]);
  const [saving, setSaving] = useState(false);

  const [featureDelete, setFeatureDelete] = useState<number | null>(null);
  const [featureEdit, setFeatureEdit] = useState<number | null>(null);
  const [brandEdit, setBrandEdit] = useState<boolean>(false);
  const [tableIndex, setTableIndex] = useState(0);
  const tableSize = 10;

  useEffect(() => {
    if (extended) {
      setFeatures(
        Array.isArray(extended.features) && extended.features.length > 0
          ? (extended.features as Feature[])
          : []
      );
    }
  }, [extended]);

  const { data: brands } = useQuery<BrandsResponse>({
    queryKey: ["brands"],
    queryFn: () => sdk.client.fetch("/admin/brands"),
  });

  const hasLen = features.length === 1;
  const isEmpty = hasLen && Object.keys(features[0]).length === 0;

  const tableCount = Math.ceil(features.length / tableSize);
  const canNextTable = tableIndex < tableCount - 1;
  const canPrevTable = tableIndex > 0;

  const nextTable = () => {
    if (canNextTable) setTableIndex(tableIndex + 1);
  };

  const prevTable = () => {
    if (canPrevTable) setTableIndex(tableIndex - 1);
  };

  const onFeatureUpdate = async (isEdit: boolean, id: number | null) => {
    setSaving(true);

    const newFeature: Feature = {
      title: featureTitle,
      value: featureValue,
    };

    let newFeatures: Feature[];
    if (isEdit) {
      const index: number = id! - 1;
      newFeatures = features.map((f, i) => (i === index ? newFeature : f));
    } else {
      newFeatures = [...features, newFeature];
    }

    await onFeatureUpdateApi(newFeatures);
  };

  const onFeatureDelete = async (id: number | null) => {
    const index: number = id! - 1;
    const newFeatures: Feature[] = features.filter((_, i) => i !== index);

    await onFeatureUpdateApi(newFeatures);
  };

  const onFeatureUpdateApi = async (newFeatures: Feature[]) => {
    try {
      await sdk.client.fetch("/store/products/update", {
        method: "POST",
        headers: HEADERS,
        body: { id: product.id, features: newFeatures },
      });

      toast.success("Success", {
        description: "Features updated.",
      });
      setFeatures(newFeatures);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update features.",
      });
    } finally {
      onClean();
    }
  };

  const onBrandUpdate = async () => {
    setSaving(true);

    try {
      await sdk.client.fetch(`/store/products/brand`, {
        method: "POST",
        headers: HEADERS,
        body: { id: product.id, brand_id: selectedBrand, is_remove: "false" },
      });

      toast.success("Success", {
        description: "Brand updated.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update brand.",
      });
    } finally {
      onClean();
    }
  };

  const onClean = () => {
    queryClient.invalidateQueries({ queryKey: [["product"]] });

    setFeatureTitle("");
    setFeatureValue("");
    setSelectedBrand(undefined);
    setSaving(false);
    setFeatureEdit(null);
    setBrandEdit(false);
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
              {extended?.brand?.name || "-"}
            </Text>
          </div>
        </div>
      </UiContainer>

      <UiContainer className="pb-4">
        <Header
          title="Features"
          actions={[
            {
              type: "button",
              props: {
                children: "Create",
                variant: "secondary",
                onClick: () => setFeatureEdit(0),
              },
            },
          ]}
        />

        <div className="flex h-full flex-col overflow-hidden !border-t-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
                <Table.HeaderCell className="text-right"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {!isEmpty &&
                features.map((feature, index) => {
                  const id = index + 1;

                  return (
                    <Table.Row key={id}>
                      <Table.Cell>{feature.title}</Table.Cell>
                      <Table.Cell>{feature.value}</Table.Cell>
                      <Table.Cell className="text-right">
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <IconButton variant="transparent">
                              <EllipsisHorizontal />
                            </IconButton>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Content>
                            <DropdownMenu.Item
                              className="gap-x-2"
                              onClick={() => {
                                setFeatureEdit(id);
                                setFeatureTitle(features[index].title);
                                setFeatureValue(features[index].value);
                              }}
                            >
                              <PencilSquare />
                              Edit
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator />

                            <DropdownMenu.Item
                              className="gap-x-2"
                              onClick={() => setFeatureDelete(id)}
                            >
                              <Trash />
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>

          <Table.Pagination
            pageCount={tableCount}
            canNextPage={canNextTable}
            canPreviousPage={canPrevTable}
            count={features.length}
            pageSize={tableSize}
            pageIndex={tableIndex}
            nextPage={nextTable}
            previousPage={prevTable}
          />
        </div>
      </UiContainer>

      <JsonView data={extended || {}} title="EXTENDED JSON" />

      {/* feature delete */}
      <Prompt
        open={featureDelete != null}
        onOpenChange={() => setFeatureDelete(null)}
      >
        <Prompt.Trigger asChild />
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Are you sure?</Prompt.Title>

            <Prompt.Description>
              You are about to delete the feature. This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>

          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={() => onFeatureDelete(featureDelete)}>
              Delete
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      {/* feature edit */}
      <Drawer
        open={featureEdit != null}
        onOpenChange={() => setFeatureEdit(null)}
      >
        <Drawer.Trigger asChild />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {featureEdit != 0 ? "Edit Feature" : "Create Feature"}
            </Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-y-4 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-x-1">
                <Label size="small" weight="plus">
                  Title
                </Label>
              </div>
              <Input
                id="feature-title"
                defaultValue={featureTitle}
                onChange={(e) => setFeatureTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-x-1">
                <Label size="small" weight="plus">
                  Value
                </Label>
              </div>
              <Input
                id="feature-value"
                defaultValue={featureValue}
                onChange={(e) => setFeatureValue(e.target.value)}
              />
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Drawer.Close>

            <Button
              onClick={() => onFeatureUpdate(featureEdit != 0, featureEdit)}
              disabled={saving || !featureTitle || !featureValue}
            >
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

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
                value={selectedBrand || undefined}
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
  zone: "product.details.side.after",
});

export default ExtendedProductWidget;
