export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected abstract initStatements(): void;
  protected abstract toModel(row: Record<string, unknown>): T;

  protected toDatabase(model: Partial<T>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(model)) {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        result[key] = JSON.stringify(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  create(_data: Omit<T, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): T {
    throw new Error('Repository is disabled, use in-memory storage');
  }

  findById(_id: string): T | null {
    return null;
  }

  findAll(): T[] {
    return [];
  }

  update(_id: string, _data: Partial<T>): T | null {
    return null;
  }

  delete(_id: string): boolean {
    return false;
  }

  count(): number {
    return 0;
  }
}
