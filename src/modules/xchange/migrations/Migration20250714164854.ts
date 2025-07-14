import { Migration } from '@mikro-orm/migrations';

export class Migration20250714164854 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "xchange" ("id" text not null, "usd" text not null, "gbp" text not null, "eur" text not null, "try" text not null, "created_on" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "xchange_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_xchange_deleted_at" ON "xchange" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "xchange" cascade;`);
  }

}
