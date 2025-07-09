import { Migration } from '@mikro-orm/migrations';

export class Migration20250708175052 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "extended_product_category" ("id" text not null, "image" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_product_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_product_category_deleted_at" ON "extended_product_category" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "extended_product_category" cascade;`);
  }

}
