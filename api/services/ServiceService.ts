import type { Service, CreateServiceRequest } from '../../shared/types.js'
import { serviceRepository, venueRepository } from '../repositories/index.js'

export class ServiceService {
  getServicesByVenue(venueId: string): Service[] {
    return serviceRepository.findByVenueId(venueId)
  }

  getServiceById(id: string): Service | null {
    return serviceRepository.findById(id)
  }

  createService(venueId: string, hostId: string, request: CreateServiceRequest): Service | null {
    const venue = venueRepository.findById(venueId)
    if (!venue || venue.hostId !== hostId) return null

    return serviceRepository.create({
      venueId,
      name: request.name,
      category: request.category,
      price: request.price,
      unit: request.unit,
      description: request.description,
      image: request.image,
    })
  }

  updateService(id: string, hostId: string, data: Partial<CreateServiceRequest>): Service | null {
    const service = serviceRepository.findById(id)
    if (!service) return null

    const venue = venueRepository.findById(service.venueId)
    if (!venue || venue.hostId !== hostId) return null

    return serviceRepository.update(id, data)
  }

  deleteService(id: string, hostId: string): boolean {
    const service = serviceRepository.findById(id)
    if (!service) return false

    const venue = venueRepository.findById(service.venueId)
    if (!venue || venue.hostId !== hostId) return false

    return serviceRepository.delete(id)
  }
}

export const serviceService = new ServiceService()
