import { Migration } from '@mikro-orm/migrations';

export class Migration20250713125256 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "extended_product" ("id" text not null, "view_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_product_deleted_at" ON "extended_product" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "extended_product" cascade;`);
  }

}
