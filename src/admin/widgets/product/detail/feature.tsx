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
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Container as UiContainer } from "@/components/container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/config";
import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";

type Feature = {
  title: string;
  value: string;
};

type AdminProductExtended = AdminProduct & {
  extended_product?: {
    features?: Feature[];
  };
};

const FeatureWidget = ({
  data: product,
}: DetailWidgetProps<AdminProductExtended>) => {
  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+extended_product.*",
      }),
    queryKey: [["product_features", product.id]],
  });

  const prod = qr?.product as AdminProductExtended;
  const extended = prod?.extended_product;

  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState<boolean>(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureDelete, setFeatureDelete] = useState<number | null>(null);
  const [featureEdit, setFeatureEdit] = useState<number | null>(null);
  const [tableIndex, setTableIndex] = useState<number>(0);
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

  const hasLen = features.length === 1;
  const isEmpty = hasLen && Object.keys(features[0]).length === 0;

  const tableCount = Math.ceil(features.length / tableSize);
  const canNextTable = tableIndex < tableCount - 1;
  const canPrevTable = tableIndex > 0;

  const onUpdate = async (isEdit: boolean, id: number | null) => {
    setSaving(true);

    const newFeature: Feature = {
      title: title,
      value: value,
    };

    let newFeatures: Feature[];
    if (isEdit) {
      const index: number = id! - 1;
      newFeatures = features.map((f, i) => (i === index ? newFeature : f));
    } else {
      newFeatures = [...features, newFeature];
    }

    await onUpdateApi(newFeatures);
  };

  const onDelete = async (id: number | null) => {
    const index: number = id! - 1;
    const newFeatures: Feature[] = features.filter((_, i) => i !== index);

    await onUpdateApi(newFeatures);
  };

  const onUpdateApi = async (newFeatures: Feature[]) => {
    const HEADERS = {
      "Content-Type": "application/json",
      "x-publishable-api-key": import.meta.env.VITE_PUBLIC_KEY,
    };

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

  const onClean = () => {
    queryClient.invalidateQueries({ queryKey: [["product_features"]] });

    setTitle("");
    setValue("");
    setSaving(false);
    setFeatureEdit(null);
  };

  return (
    <>
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
                              <EllipsisHorizontal className="text-ui-fg-subtle" />
                            </IconButton>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Content>
                            <DropdownMenu.Item
                              className="gap-x-2"
                              onClick={() => {
                                setFeatureEdit(id);
                                setTitle(features[index].title);
                                setValue(features[index].value);
                              }}
                            >
                              <PencilSquare className="text-ui-fg-subtle" />
                              Edit
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator />

                            <DropdownMenu.Item
                              className="gap-x-2"
                              onClick={() => setFeatureDelete(id)}
                            >
                              <Trash className="text-ui-fg-subtle" />
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
            nextPage={() => {
              if (canNextTable) setTableIndex(tableIndex + 1);
            }}
            previousPage={() => {
              if (canPrevTable) setTableIndex(tableIndex - 1);
            }}
          />
        </div>
      </UiContainer>

      {/* delete */}
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
            <Prompt.Action onClick={() => onDelete(featureDelete)}>
              Delete
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      {/* edit */}
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
                defaultValue={title}
                onChange={(e) => setTitle(e.target.value)}
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
                defaultValue={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Drawer.Close>

            <Button
              onClick={() => onUpdate(featureEdit != 0, featureEdit)}
              disabled={saving || !title || !value}
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

export default FeatureWidget;
