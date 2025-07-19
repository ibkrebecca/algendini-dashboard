import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminCustomer, DetailWidgetProps } from "@medusajs/framework/types";
import { Text, Select, DatePicker, Switch, Label, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Container as UiContainer } from "@/components/container";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/config";
import { Thumbnail } from "@/components/thumbnail";
import { FilePreview } from "@/components/file/file-preview";

type AdminCustomerExtended = AdminCustomer & {
  extended_customer?: {
    avatar_url?: string;
    dob?: string;
    gender?: string;
    is_admin?: boolean;
    is_driver?: boolean;
  };
};

// the extended customer widget
const ExtendedCustomerWidget = ({
  data: customer,
}: DetailWidgetProps<AdminCustomerExtended>) => {
  const { data: qr } = useQuery({
    queryFn: () =>
      sdk.admin.customer.retrieve(customer.id, {
        fields: "+extended_customer.*",
      }),
    queryKey: [["customer", customer.id]],
  });

  const cus = qr?.customer as AdminCustomerExtended;
  const extended = cus?.extended_customer;

  const [avatar, setAvatar] = useState<string>("");
  const [dob, setDob] = useState<Date>(new Date());
  const [gender, setGender] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDriver, setIsDriver] = useState<boolean>(false);

  useEffect(() => {
    if (extended) {
      setAvatar(extended.avatar_url || "");
      setDob(extended.dob ? new Date(extended.dob) : new Date());
      setGender(extended.gender || "");
      setIsAdmin(extended.is_admin || false);
      setIsDriver(extended.is_driver || false);
    }
  }, [extended]);

  const onDriverChange = async (checked: boolean) => {
    setIsDriver(checked);

    await sdk.client.fetch("/store/customers/update", {
      method: "POST",
      body: { id: customer.id, is_driver: checked },
    });

    toast.success("Success", {
      description: checked
        ? "Customer is now a driver."
        : "Customer is not longer a driver.",
    });
  };

  return (
    <UiContainer>
      <Header title="Others" />

      <div className="flex flex-col gap-y-4 px-6 py-4">
        <div>
          <Text className="mb-2">Avatar</Text>

          <div className="flex items-center gap-x-5">
            <Thumbnail src={avatar} alt="avatar image" size="large" />

            <FilePreview
              className="w-full"
              filename="avatar image file"
              url={avatar}
            />
          </div>
        </div>

        <div>
          <Text className="mb-2">Date Of Birth</Text>
          <DatePicker
            key={dob.toDateString() || "default"}
            isReadOnly
            isDisabled
            value={dob}
            label="Date Of Birth"
          />
        </div>

        <div>
          <Text className="mb-2">Gender</Text>

          <Select defaultValue={gender} value={gender}>
            <Select.Trigger>
              <Select.Value placeholder="Select a gender" />
            </Select.Trigger>

            <Select.Content>
              {["male", "female"].map((i) => (
                <Select.Item key={i} value={i}>
                  {i.toUpperCase()}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <hr className="my-4" />

        <div className="flex items-center justify-between gap-x-2">
          <Label htmlFor="manage-driver">Is Customer A Driver?</Label>
          <Switch
            id="manage-driver"
            checked={isDriver}
            onCheckedChange={onDriverChange}
          />
        </div>

        <div className="flex items-center justify-between gap-x-2">
          <Label htmlFor="manage-admin">Is Customer Administrator?</Label>
          <Switch id="manage-admin" disabled defaultChecked={isAdmin} />
        </div>
      </div>
    </UiContainer>
  );
};

export const config = defineWidgetConfig({
  zone: "customer.details.side.before",
});

export default ExtendedCustomerWidget;
