import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION);

  const NODE_ENV = process.env.NODE_ENV;

  const ADMIN_URL = process.env.ADMIN_URL;
  const STORE_URL = process.env.STORE_URL;
  const TEMPLATE_EN = process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_EN!;
  const TEMPLATE_TR = process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_TR!;

  // const TEMPLATE = locale === "tr" ? TEMPLATE_TR : TEMPLATE_EN;
  const urlPrefix = actor_type === "customer" ? STORE_URL : ADMIN_URL;

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    // template: TEMPLATE,
    template: TEMPLATE_EN,
    data: {
      url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
      year: new Date().getFullYear(),
    },
  });
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
