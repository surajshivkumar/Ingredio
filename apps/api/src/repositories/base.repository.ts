import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { PgTable, PgColumn } from "drizzle-orm/pg-core";

export default class BaseRepository<TTable extends PgTable> {
  protected db = db;
  protected table: TTable;
  protected idColumn: PgColumn;

  constructor(table: TTable, idColumn: PgColumn) {
    this.table = table;
    this.idColumn = idColumn;
  }

  async findById(id: string) {
    const table = this.table as unknown as Record<string, unknown>;
    const [result] = await (this.db.select().from(table as any) as any).where(eq(this.idColumn, id));
    return result || null;
  }

  async findMany() {
    const table = this.table as unknown as Record<string, unknown>;
    const results = await (this.db.select().from(table as any) as any);
    return results;
  }

  async insert(data: Record<string, unknown>) {
    const table = this.table as unknown as Record<string, unknown>;
    const [result] = await (this.db.insert(table as any).values(data) as any).returning();
    return result;
  }

  async update(id: string, data: Record<string, unknown>) {
    const table = this.table as unknown as Record<string, unknown>;
    const [result] = await (this.db.update(table as any).set(data).where(eq(this.idColumn, id)) as any).returning();
    return result;
  }

  async delete(id: string) {
    const table = this.table as unknown as Record<string, unknown>;
    const [result] = await (this.db.delete(table as any).where(eq(this.idColumn, id)) as any).returning();
    return result;
  }

  async updateMany(updates: { id: string; data: Record<string, unknown> }[]) {
    const table = this.table as unknown as Record<string, unknown>;
    return await this.db.transaction(async (tx) => {
      const results: unknown[] = [];
      for (const update of updates) {
        const [res] = await (tx.update(table as any).set(update.data).where(eq(this.idColumn, update.id)) as any).returning();
        results.push(res);
      }
      return results;
    });
  }

  async deleteMany(ids: string[]) {
    const table = this.table as unknown as Record<string, unknown>;
    return await (this.db.delete(table as any).where(inArray(this.idColumn, ids)) as any).returning();
  }
}
