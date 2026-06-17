import type {
  ApiResponse,
  User,
  Venue,
  Booking,
  Service,
  PriceConfig,
  Review,
  CreateVenueRequest,
  CreateBookingRequest,
  CreateServiceRequest,
  PriceConfigRequest,
  CreateReviewRequest,
  VenueFilterParams,
  PaginationParams,
  BookingStatus,
  BookingRateData,
  RevenueData,
  EventTypeData,
  MonthlyRevenueData,
  UserRole,
} from '../../shared/types';

const BASE_URL = '/api';

const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
  requiresAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, requiresAuth = false, headers, ...restOptions } = options;

  const url = `${BASE_URL}${endpoint}${params ? buildQueryString(params) : ''}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });

    let data: ApiResponse<T>;
    try {
      data = (await response.json()) as ApiResponse<T>;
    } catch {
      data = {
        success: response.ok,
        message: response.ok ? '请求成功' : '响应解析失败',
      } as ApiResponse<T>;
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : '网络请求失败';
    return {
      success: false,
      message,
    } as ApiResponse<T>;
  }
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  company?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<null>('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    }),

  getCurrentUser: () =>
    request<User>('/auth/me', {
      method: 'GET',
      requiresAuth: true,
    }),
};

export const venuesApi = {
  getVenues: (params?: VenueFilterParams & Partial<PaginationParams>) =>
    request<Venue[]>('/venues', {
      method: 'GET',
      params: params as Record<string, unknown>,
    }),

  getMyVenues: () =>
    request<Venue[]>('/venues/my', {
      method: 'GET',
      requiresAuth: true,
    }),

  getVenueById: (id: string) =>
    request<Venue>(`/venues/${id}`, {
      method: 'GET',
    }),

  createVenue: (data: CreateVenueRequest) =>
    request<Venue>('/venues', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  updateVenue: (id: string, data: Partial<CreateVenueRequest>) =>
    request<Venue>(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  deleteVenue: (id: string) =>
    request<null>(`/venues/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

export const pricingApi = {
  getPriceConfigsByVenue: (venueId: string) =>
    request<PriceConfig[]>(`/venues/${venueId}/pricing`, {
      method: 'GET',
    }),

  createPriceConfig: (venueId: string, data: PriceConfigRequest) =>
    request<PriceConfig>(`/venues/${venueId}/pricing`, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  updatePriceConfig: (id: string, data: Partial<PriceConfigRequest>) =>
    request<PriceConfig>(`/pricing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  deletePriceConfig: (id: string) =>
    request<null>(`/pricing/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

export const servicesApi = {
  getServicesByVenue: (venueId: string) =>
    request<Service[]>(`/venues/${venueId}/services`, {
      method: 'GET',
    }),

  createService: (venueId: string, data: CreateServiceRequest) =>
    request<Service>(`/venues/${venueId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  updateService: (id: string, data: Partial<CreateServiceRequest>) =>
    request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  deleteService: (id: string) =>
    request<null>(`/services/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

export const bookingsApi = {
  getBookings: (params?: { status?: BookingStatus }) =>
    request<Booking[]>('/bookings', {
      method: 'GET',
      params: params as Record<string, unknown>,
      requiresAuth: true,
    }),

  getBookingById: (id: string) =>
    request<Booking>(`/bookings/${id}`, {
      method: 'GET',
      requiresAuth: true,
    }),

  createBooking: (data: CreateBookingRequest) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  updateBookingStatus: (
    id: string,
    data: { status: BookingStatus; hostReply?: string }
  ) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  payDeposit: (id: string) =>
    request<Booking>(`/bookings/${id}/pay-deposit`, {
      method: 'POST',
      requiresAuth: true,
    }),

  deleteBooking: (id: string) =>
    request<null>(`/bookings/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

export const reviewsApi = {
  getReviewsByVenue: (
    venueId: string,
    params?: Partial<PaginationParams>
  ) =>
    request<Review[]>(`/venues/${venueId}/reviews`, {
      method: 'GET',
      params: params as Record<string, unknown>,
    }),

  createReview: (data: CreateReviewRequest) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  replyToReview: (id: string, reply: string) =>
    request<Review>(`/reviews/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply }),
      requiresAuth: true,
    }),
};

interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  venueId?: string;
}

interface HostOverviewData {
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
}

interface AdminOverviewData {
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  hostCount: number;
  customerCount: number;
}

export const analyticsApi = {
  getBookingRate: (params?: AnalyticsParams) =>
    request<BookingRateData[]>('/host/analytics/booking-rate', {
      method: 'GET',
      params: params as Record<string, unknown>,
      requiresAuth: true,
    }),

  getRevenue: (params?: Omit<AnalyticsParams, 'venueId'>) =>
    request<RevenueData[]>('/host/analytics/revenue', {
      method: 'GET',
      params: params as Record<string, unknown>,
      requiresAuth: true,
    }),

  getEventTypes: (params?: Omit<AnalyticsParams, 'venueId'>) =>
    request<EventTypeData[]>('/host/analytics/event-types', {
      method: 'GET',
      params: params as Record<string, unknown>,
      requiresAuth: true,
    }),

  getHostOverview: () =>
    request<HostOverviewData>('/host/analytics/overview', {
      method: 'GET',
      requiresAuth: true,
    }),

  getMonthlyRevenue: (params?: { year?: number }) =>
    request<MonthlyRevenueData[]>('/host/analytics/monthly-revenue', {
      method: 'GET',
      params: params as Record<string, unknown>,
      requiresAuth: true,
    }),

  getAdminOverview: () =>
    request<AdminOverviewData>('/admin/analytics/overview', {
      method: 'GET',
      requiresAuth: true,
    }),
};
