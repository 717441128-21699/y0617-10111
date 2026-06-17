import type { User } from '../../shared/types.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  protected initStatements(): void {}
  protected toModel(_row: Record<string, unknown>): User {
    return {} as User;
  }

  findByEmail(_email: string): User | null {
    return null;
  }

  findByRole(_role: string): User[] {
    return [];
  }
}

export const userRepository = new UserRepository();
