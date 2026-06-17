import type { Booking, CreateBookingRequest, BookingStatus, SelectedService } from '../../shared/types.js'
import { bookingRepository, venueRepository, priceConfigRepository, serviceRepository } from '../repositories/index.js'

export class BookingService {
  getBookingById(id: string): Booking | null {
    return bookingRepository.findById(id)
  }

  getBookingsByUser(userId: string, status?: BookingStatus): Booking[] {
    if (status) {
      return bookingRepository.findByUserIdAndStatus(userId, status)
    }
    return bookingRepository.findByUserId(userId)
  }

  getBookingsByHost(hostId: string, status?: BookingStatus): Booking[] {
    if (status) {
      return bookingRepository.getBookingsByHostAndStatus(hostId, status)
    }
    return bookingRepository.getUpcomingBookingsByHost(hostId)
  }

  createBooking(userId: string, request: CreateBookingRequest): Booking | null {
    const venue = venueRepository.findById(request.venueId)
    if (!venue) return null

    const overlap = bookingRepository.checkOverlap(request.venueId, request.date, request.timeSlot)
    if (overlap) return null

    const priceConfig = priceConfigRepository.findByVenueDateAndSlot(
      request.venueId,
      request.date,
      request.timeSlot
    )

    let basePrice = venue.basePrice
    if (priceConfig) {
      basePrice = priceConfig.price
    }

    let servicesTotal = 0
    for (const ss of request.selectedServices) {
      const service = serviceRepository.findById(ss.serviceId)
      if (service && service.venueId === request.venueId) {
        servicesTotal += service.price * ss.quantity
      }
    }

    const totalAmount = basePrice + servicesTotal
    const deposit = Math.round(totalAmount * 0.3)

    return bookingRepository.create({
      venueId: request.venueId,
      userId,
      date: request.date,
      timeSlot: request.timeSlot,
      eventType: request.eventType,
      estimatedPeople: request.estimatedPeople,
      specialRequirements: request.specialRequirements,
      selectedServices: request.selectedServices as SelectedService[],
      totalAmount,
      deposit,
      status: 'pending' as BookingStatus,
      createdAt: new Date().toISOString(),
    })
  }

  updateBookingStatus(id: string, hostId: string, status: BookingStatus, hostReply?: string): Booking | null {
    const booking = bookingRepository.findById(id)
    if (!booking) return null

    const venue = venueRepository.findById(booking.venueId)
    if (!venue || venue.hostId !== hostId) return null

    return bookingRepository.updateStatus(id, status, hostReply)
  }

  payDeposit(id: string, userId: string): Booking | null {
    const booking = bookingRepository.findById(id)
    if (!booking || booking.userId !== userId) return null
    if (booking.status !== 'approved') return null

    return bookingRepository.updateStatus(id, 'depositPaid' as BookingStatus, '定金已支付')
  }

  deleteBooking(id: string, userId: string): boolean {
    const booking = bookingRepository.findById(id)
    if (!booking || booking.userId !== userId) return false
    if (!['pending', 'approved'].includes(booking.status)) return false

    return bookingRepository.delete(id)
  }
}

export const bookingService = new BookingService()
