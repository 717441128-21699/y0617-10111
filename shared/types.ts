export type VenueType = 'banquet' | 'exhibition' | 'outdoor' | 'conference' | 'other';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'fullDay';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'depositPaid' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceCategory = 'catering' | 'audio' | 'decoration' | 'other';
export type UserRole = 'host' | 'customer' | 'admin';
export type VenueStatus = 'draft' | 'pending' | 'published' | 'offline';

export interface StyleImage {
  name: string;
  url: string;
}

export interface SelectedService {
  serviceId: string;
  quantity: number;
}

export interface ServiceDetail {
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string;
  quantity: number;
  subtotal: number;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  city: string;
  address: string;
  area: number;
  capacity: number;
  height?: number;
  description: string;
  facilities: string[];
  images: string[];
  styleImages: StyleImage[];
  basePrice: number;
  rating: number;
  reviewCount: number;
  status: VenueStatus;
  hostId: string;
  createdAt: string;
}

export interface PriceConfig {
  id: string;
  venueId: string;
  date: string;
  timeSlot: TimeSlot;
  price: number;
  isHoliday: boolean;
  isWeekend: boolean;
}

export interface Service {
  id: string;
  venueId: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string;
  description: string;
  image?: string;
}

export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  date: string;
  timeSlot: TimeSlot;
  eventType: string;
  estimatedPeople: number;
  specialRequirements?: string;
  selectedServices: SelectedService[];
  totalAmount: number;
  deposit: number;
  status: BookingStatus;
  hostReply?: string;
  createdAt: string;
  venue?: Venue;
  user?: User;
  servicesDetail?: ServiceDetail[];
}

export interface Review {
  id: string;
  bookingId: string;
  venueId: string;
  userId: string;
  rating: number;
  content: string;
  hostReply?: string;
  userReply?: string;
  createdAt: string;
  venue?: Venue;
  user?: User;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  company?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface VenueFilterParams {
  city?: string;
  type?: VenueType;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  date?: string;
  facilities?: string[];
  keyword?: string;
  sortBy?: 'price' | 'rating' | 'bookings' | 'area';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVenueRequest {
  name: string;
  type: VenueType;
  city: string;
  address: string;
  area: number;
  capacity: number;
  height?: number;
  description: string;
  facilities: string[];
  images: string[];
  styleImages: StyleImage[];
  basePrice: number;
}

export interface CreateBookingRequest {
  venueId: string;
  date: string;
  timeSlot: TimeSlot;
  eventType: string;
  estimatedPeople: number;
  specialRequirements?: string;
  selectedServices: SelectedService[];
}

export interface CreateServiceRequest {
  venueId: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string;
  description: string;
  image?: string;
}

export interface PriceConfigRequest {
  venueId: string;
  date: string;
  timeSlot: TimeSlot;
  price: number;
  isHoliday?: boolean;
}

export interface CreateReviewRequest {
  bookingId: string;
  venueId: string;
  rating: number;
  content: string;
}

export interface BookingRateData {
  date: string;
  rate: number;
  totalSlots: number;
  bookedSlots: number;
}

export interface RevenueData {
  source: 'venue' | 'service';
  amount: number;
  percentage: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalVenueRevenue: number;
  totalServiceRevenue: number;
  venuePercentage: number;
  servicePercentage: number;
}

export interface EventTypeData {
  type: string;
  count: number;
  percentage: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  venueRevenue: number;
  serviceRevenue: number;
  bookings: number;
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  banquet: '宴会厅',
  exhibition: '展览馆',
  outdoor: '户外场地',
  conference: '会议中心',
  other: '其他场地',
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '上午（09:00-12:00）',
  afternoon: '下午（14:00-17:00）',
  evening: '晚间（18:00-22:00）',
  fullDay: '全天（09:00-22:00）',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  depositPaid: '定金已付',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  catering: '餐饮套餐',
  audio: '音响设备',
  decoration: '布置服务',
  other: '其他服务',
};

export const EVENT_TYPES = [
  '婚礼婚宴',
  '企业年会',
  '产品发布会',
  '展览展会',
  '学术会议',
  '培训讲座',
  '生日派对',
  '团建活动',
  '其他活动',
];

export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];

export const FACILITIES = [
  '舞台', '灯光', '音响', '投影', '化妆间', '停车场', 'WIFI',
  '空调', '桌椅', '厨房', '吧台', '电梯', '无障碍通道', '电源接口',
];
