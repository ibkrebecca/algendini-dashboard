import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  EllipsisHorizontal,
  PencilSquare,
  TagSolid,
  Trash,
} from "@medusajs/icons";
import {
  Button,
  Container,
  Drawer,
  DropdownMenu,
  IconButton,
  Input,
  Label,
  Prompt,
  toast,
} from "@medusajs/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";

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

const columnHelper = createDataTableColumnHelper<Brand>();

const BrandsPage = () => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteBrand, setDeleteBrand] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState<string | null>(null);

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const brand = row.original;

        return (
          <div className="text-right">
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
                    setEditBrand(brand.id);
                    setName(brand.name);
                  }}
                >
                  <PencilSquare className="text-ui-fg-subtle" />
                  Edit
                </DropdownMenu.Item>

                <DropdownMenu.Separator />

                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setDeleteBrand(brand.id)}
                >
                  <Trash className="text-ui-fg-subtle" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const limit = 25;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const { data, isLoading } = useQuery<BrandsResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/brands`, {
        query: {
          limit,
          offset,
          order: "-created_at",
        },
      }),
    queryKey: [["brands", limit, offset]],
  });

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  const queryClient = useQueryClient();
  const IS_PROD = import.meta.env.PROD;
  const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
  const LOCAL_PUBLIC_KEY = import.meta.env.VITE_LOCAL_PUBLIC_KEY;
  const HEADERS = {
    "Content-Type": "application/json",
    "x-publishable-api-key": IS_PROD ? PUBLIC_KEY : LOCAL_PUBLIC_KEY,
  };

  const onUpdate = async (isEdit: boolean, id: string | null) => {
    setSaving(true);

    if (isEdit) {
      await sdk.client.fetch("/store/brands/update", {
        method: "POST",
        headers: HEADERS,
        body: { id, name },
      });
      toast.success("Success", {
        description: "Brand updated.",
      });
    } else {
      await sdk.client.fetch("/store/brands/update", {
        method: "POST",
        headers: HEADERS,
        body: { name },
      });

      toast.success("Success", {
        description: "Brand created.",
      });
    }

    onClean();
  };

  const onDelete = async (id: string | null) => {
    await sdk.client.fetch("/store/brands/delete", {
      method: "POST",
      headers: HEADERS,
      body: { id },
    });

    onClean();
  };

  const onClean = () => {
    queryClient.invalidateQueries({ queryKey: [["brands"]] });

    setName("");
    setSaving(false);
    setEditBrand(null);
  };

  return (
    <>
      <Container className="divide-y p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <Heading>Brands</Heading>
            <Button onClick={() => setEditBrand("0")}>Create</Button>
          </DataTable.Toolbar>

          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>

      <Prompt
        open={deleteBrand != null}
        onOpenChange={() => setDeleteBrand(null)}
      >
        <Prompt.Trigger asChild />
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Are you sure?</Prompt.Title>

            <Prompt.Description>
              You are about to delete the brand. This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>

          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={() => onDelete(deleteBrand)}>
              Delete
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      <Drawer open={editBrand != null} onOpenChange={() => setEditBrand(null)}>
        <Drawer.Trigger asChild />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editBrand != "0" ? "Edit Brand" : "Create Brand"}
            </Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-y-4 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-x-1">
                <Label size="small" weight="plus">
                  Name
                </Label>
              </div>
              <Input
                id="brand-name"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Drawer.Close>

            <Button
              onClick={() => onUpdate(editBrand != "0", editBrand)}
              disabled={saving || !name}
            >
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export const config = defineRouteConfig({
  label: "Brands",
  icon: TagSolid,
});

export default BrandsPage;
