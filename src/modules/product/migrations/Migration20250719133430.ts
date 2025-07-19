import { Migration } from '@mikro-orm/migrations';

export class Migration20250719133430 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "extended_product" ("id" text not null, "features" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_product_deleted_at" ON "extended_product" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "extended" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "extended" ("id" text not null, "features" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_deleted_at" ON "extended" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "extended_product" cascade;`);
  }

}
