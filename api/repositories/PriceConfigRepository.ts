import type { PriceConfig, TimeSlot } from '../../shared/types.js';
import { BaseRepository } from './BaseRepository.js';

export class PriceConfigRepository extends BaseRepository<PriceConfig> {
  constructor() {
    super('priceConfigs');
  }

  protected initStatements(): void {}
  protected toModel(_row: Record<string, unknown>): PriceConfig {
    return {} as PriceConfig;
  }

  findByVenueId(_venueId: string): PriceConfig[] {
    return [];
  }

  findByVenueAndDate(_venueId: string, _date: string): PriceConfig[] {
    return [];
  }

  findByVenueAndDateRange(_venueId: string, _startDate: string, _endDate: string): PriceConfig[] {
    return [];
  }

  findByVenueDateAndSlot(_venueId: string, _date: string, _timeSlot: TimeSlot): PriceConfig | null {
    return null;
  }

  deleteByVenueAndDate(_venueId: string, _date: string): boolean {
    return false;
  }
}

export const priceConfigRepository = new PriceConfigRepository();
