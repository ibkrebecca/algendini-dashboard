import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Header } from "../components/header";
import { Container as UiContainer } from "../components/container";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../lib/config";
import { JsonView } from "./json_view";

type AdminProductExtended = AdminProduct & {
  extended_product?: {
    view_count?: number;
    features?: object[];
  };
};

// the extended product widget
const ExtendedProductWidget = ({
  data: product,
}: DetailWidgetProps<AdminProductExtended>) => {
  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+extended_product.*",
      }),
    queryKey: [["product", product.id]],
  });

  const prod = qr?.product as AdminProductExtended;
  const extended = prod?.extended_product;

  const [features, setFeatures] = useState([{}]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (extended) {
      setFeatures(
        Array.isArray(extended.features) && extended.features.length > 0
          ? (extended.features as { title: string; value: string }[])
          : []
      );
    }
  }, [extended]);

  const IS_PROD = import.meta.env.PROD;
  const STORE_URL = import.meta.env.VITE_STORE_URL;
  const LOCAL_STORE_URL = import.meta.env.VITE_LOCAL_STORE_URL;
  const BASE_URL = IS_PROD ? STORE_URL : LOCAL_STORE_URL;

  const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
  const LOCAL_PUBLIC_KEY = import.meta.env.VITE_LOCAL_PUBLIC_KEY;
  const P_KEY = IS_PROD ? PUBLIC_KEY : LOCAL_PUBLIC_KEY;

  const hasLen = features.length === 1;
  const isEmpty = hasLen && Object.keys(features[0]).length === 0;

  const onUpdate = async () => {
    setSaving(true);
    const url = `${BASE_URL}/store/products/update`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": P_KEY,
      },
      body: JSON.stringify({ id: product.id, features: features }),
      credentials: "include",
    });

    if (!res.ok) {
      toast.error("Error", {
        description: "Failed to update product features.",
      });
      setSaving(false);
    }

    toast.success("Success", {
      description: "Product features updated.",
    });
    setSaving(false);
  };

  return (
    <>
      <UiContainer>
        <Header title="Features" />

        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex justify-end">
            <Button onClick={onUpdate} disabled={saving || isEmpty}>
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
  zone: "product.details.side.after",
});

export default ExtendedProductWidget;
