import type { Service, ServiceCategory } from '../../shared/types.js';
import { BaseRepository } from './BaseRepository.js';

export class ServiceRepository extends BaseRepository<Service> {
  constructor() {
    super('services');
  }

  protected initStatements(): void {}
  protected toModel(_row: Record<string, unknown>): Service {
    return {} as Service;
  }

  findByVenueId(_venueId: string): Service[] {
    return [];
  }

  findByVenueIdAndCategory(_venueId: string, _category: ServiceCategory): Service[] {
    return [];
  }

  findByCategory(_category: ServiceCategory): Service[] {
    return [];
  }
}

export const serviceRepository = new ServiceRepository();
