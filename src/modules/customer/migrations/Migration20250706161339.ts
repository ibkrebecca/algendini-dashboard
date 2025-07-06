import { Migration } from '@mikro-orm/migrations';

export class Migration20250706161339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "extended_customer" add column if not exists "avatar_url" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "extended_customer" drop column if exists "avatar_url";`);
  }

}
