import type { Venue, CreateVenueRequest, VenueFilterParams, PaginationParams, VenueStatus } from '../../shared/types.js'
import { venueRepository } from '../repositories/index.js'

export class VenueService {
  getVenueById(id: string): Venue | null {
    return venueRepository.findById(id)
  }

  getVenues(filters: VenueFilterParams & PaginationParams): { venues: Venue[]; total: number } {
    return venueRepository.filter(filters)
  }

  getVenuesByHost(hostId: string): Venue[] {
    return venueRepository.findByHostId(hostId)
  }

  createVenue(hostId: string, request: CreateVenueRequest): Venue {
    return venueRepository.create({
      ...request,
      hostId,
      rating: 0,
      reviewCount: 0,
      status: 'pending' as VenueStatus,
      createdAt: new Date().toISOString(),
    })
  }

  updateVenue(id: string, hostId: string, data: Partial<CreateVenueRequest>): Venue | null {
    const venue = venueRepository.findById(id)
    if (!venue || venue.hostId !== hostId) return null
    return venueRepository.update(id, data)
  }

  deleteVenue(id: string, hostId: string): boolean {
    const venue = venueRepository.findById(id)
    if (!venue || venue.hostId !== hostId) return false
    return venueRepository.delete(id)
  }

  updateVenueStatus(id: string, status: VenueStatus): Venue | null {
    return venueRepository.updateStatus(id, status)
  }
}

export const venueService = new VenueService()
