import { Migration } from '@mikro-orm/migrations';

export class Migration20250716115215 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "extended_product" add column if not exists "features" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "extended_product" drop column if exists "features";`);
  }

}
