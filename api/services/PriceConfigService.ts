import type { PriceConfig, PriceConfigRequest } from '../../shared/types.js'
import { priceConfigRepository, venueRepository } from '../repositories/index.js'

export class PriceConfigService {
  getPriceConfigsByVenue(venueId: string): PriceConfig[] {
    return priceConfigRepository.findByVenueId(venueId)
  }

  getPriceConfigById(id: string): PriceConfig | null {
    return priceConfigRepository.findById(id)
  }

  createPriceConfig(venueId: string, hostId: string, request: PriceConfigRequest): PriceConfig | null {
    const venue = venueRepository.findById(venueId)
    if (!venue || venue.hostId !== hostId) return null

    const isWeekend = (dateStr: string): boolean => {
      const day = new Date(dateStr).getDay()
      return day === 0 || day === 6
    }

    return priceConfigRepository.create({
      venueId,
      date: request.date,
      timeSlot: request.timeSlot,
      price: request.price,
      isHoliday: request.isHoliday || false,
      isWeekend: isWeekend(request.date),
    })
  }

  updatePriceConfig(id: string, hostId: string, data: Partial<PriceConfigRequest>): PriceConfig | null {
    const config = priceConfigRepository.findById(id)
    if (!config) return null

    const venue = venueRepository.findById(config.venueId)
    if (!venue || venue.hostId !== hostId) return null

    return priceConfigRepository.update(id, data)
  }

  deletePriceConfig(id: string, hostId: string): boolean {
    const config = priceConfigRepository.findById(id)
    if (!config) return false

    const venue = venueRepository.findById(config.venueId)
    if (!venue || venue.hostId !== hostId) return false

    return priceConfigRepository.delete(id)
  }
}

export const priceConfigService = new PriceConfigService()
