import type { Service, CreateServiceRequest } from '../../shared/types.js';
import { services, venues, generateId, db } from '../persistedData.js';

export class ServiceService {
  getServicesByVenue(venueId: string): Service[] {
    return services.filter((s) => s.venueId === venueId);
  }

  getServiceById(id: string): Service | null {
    return services.find((s) => s.id === id) || null;
  }

  createService(venueId: string, hostId: string, request: CreateServiceRequest): Service | null {
    const venue = venues.find((v) => v.id === venueId);
    if (!venue || venue.hostId !== hostId) return null;

    const id = generateId('service');
    const service: Service = {
      id,
      venueId,
      name: request.name,
      category: request.category,
      price: request.price,
      unit: request.unit,
      description: request.description,
      image: request.image,
    };

    services.push(service);
    db.write();
    return service;
  }

  updateService(id: string, hostId: string, data: Partial<CreateServiceRequest>): Service | null {
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const venue = venues.find((v) => v.id === services[index].venueId);
    if (!venue || venue.hostId !== hostId) return null;

    services[index] = { ...services[index], ...data };
    db.write();
    return services[index];
  }

  deleteService(id: string, hostId: string): boolean {
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const venue = venues.find((v) => v.id === services[index].venueId);
    if (!venue || venue.hostId !== hostId) return false;

    services.splice(index, 1);
    db.write();
    return true;
  }
}

export const serviceService = new ServiceService();
