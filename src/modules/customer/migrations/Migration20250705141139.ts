import { Migration } from '@mikro-orm/migrations';

export class Migration20250705141139 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "extended_customer" ("id" text not null, "dob" timestamptz not null, "gender" text not null, "is_admin" boolean not null default false, "is_driver" boolean not null default false, "created_on" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_customer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_customer_deleted_at" ON "extended_customer" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "extended_customer_address" ("id" text not null, "place_id" text not null, "city_country" text not null, "lat" text not null, "lng" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "extended_customer_address_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_extended_customer_address_deleted_at" ON "extended_customer_address" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "extended_customer" cascade;`);

    this.addSql(`drop table if exists "extended_customer_address" cascade;`);
  }

}
