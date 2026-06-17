import type { PriceConfig, PriceConfigRequest } from '../../shared/types.js';
import { priceConfigs, venues, generateId } from '../inMemoryData.js';

export class PriceConfigService {
  getPriceConfigsByVenue(venueId: string): PriceConfig[] {
    return priceConfigs.filter((pc) => pc.venueId === venueId);
  }

  getPriceConfigById(id: string): PriceConfig | null {
    return priceConfigs.find((pc) => pc.id === id) || null;
  }

  createPriceConfig(venueId: string, hostId: string, request: PriceConfigRequest): PriceConfig | null {
    const venue = venues.find((v) => v.id === venueId);
    if (!venue || venue.hostId !== hostId) return null;

    const isWeekend = (dateStr: string): boolean => {
      const day = new Date(dateStr).getDay();
      return day === 0 || day === 6;
    };

    const id = generateId('price');
    const config: PriceConfig = {
      id,
      venueId,
      date: request.date,
      timeSlot: request.timeSlot,
      price: request.price,
      isHoliday: request.isHoliday || false,
      isWeekend: isWeekend(request.date),
    };

    priceConfigs.push(config);
    return config;
  }

  updatePriceConfig(id: string, hostId: string, data: Partial<PriceConfigRequest>): PriceConfig | null {
    const index = priceConfigs.findIndex((pc) => pc.id === id);
    if (index === -1) return null;

    const venue = venues.find((v) => v.id === priceConfigs[index].venueId);
    if (!venue || venue.hostId !== hostId) return null;

    const updated = { ...priceConfigs[index], ...data };
    if (data.date) {
      const day = new Date(data.date).getDay();
      updated.isWeekend = day === 0 || day === 6;
    }
    priceConfigs[index] = updated;
    return priceConfigs[index];
  }

  deletePriceConfig(id: string, hostId: string): boolean {
    const index = priceConfigs.findIndex((pc) => pc.id === id);
    if (index === -1) return false;

    const venue = venues.find((v) => v.id === priceConfigs[index].venueId);
    if (!venue || venue.hostId !== hostId) return false;

    priceConfigs.splice(index, 1);
    return true;
  }
}

export const priceConfigService = new PriceConfigService();
