import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Maximize,
  LayoutGrid,
  Check,
  Plus,
  Minus,
  CalendarDays,
  Clock,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import StarRating from '@/components/StarRating';
import DatePicker from '@/components/DatePicker';
import {
  venuesApi,
  servicesApi,
  pricingApi,
  bookingsApi,
  reviewsApi,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type {
  Venue,
  Service,
  PriceConfig,
  Review,
  TimeSlot,
  SelectedService,
} from '@/../shared/types';
import {
  VENUE_TYPE_LABELS,
  TIME_SLOT_LABELS,
  SERVICE_CATEGORY_LABELS,
  EVENT_TYPES,
} from '@/../shared/types';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [priceConfigs, setPriceConfigs] = useState<PriceConfig[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [activeStyleTab, setActiveStyleTab] = useState(0);

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [selectedServices, setSelectedServices] = useState<
    Map<string, SelectedService & { checked: boolean }>
  >(new Map());

  const [timeSlot, setTimeSlot] = useState<TimeSlot>('fullDay');
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [estimatedPeople, setEstimatedPeople] = useState<number>(100);
  const [specialRequirements, setSpecialRequirements] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Map<string, Set<TimeSlot>>>(new Map());

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [venueRes, servicesRes, pricingRes, reviewsRes, bookedSlotsRes] =
          await Promise.all([
            venuesApi.getVenueById(id),
            servicesApi.getServicesByVenue(id),
            pricingApi.getPriceConfigsByVenue(id),
            reviewsApi.getReviewsByVenue(id),
            venuesApi.getBookedSlots(id),
          ]);

        if (!venueRes.success || !venueRes.data) {
          setError(venueRes.message || '加载场地信息失败');
          return;
        }

        setVenue(venueRes.data);
        setServices(servicesRes.data || []);
        setPriceConfigs(pricingRes.data || []);
        setReviews(reviewsRes.data || []);

        const slotsMap = new Map<string, Set<TimeSlot>>();
        (bookedSlotsRes.data || []).forEach((s) => {
          if (!slotsMap.has(s.date)) {
            slotsMap.set(s.date, new Set());
          }
          slotsMap.get(s.date)!.add(s.timeSlot);
        });
        setBookedSlots(slotsMap);

        const initial = new Map<string, SelectedService & { checked: boolean }>();
        (servicesRes.data || []).forEach((s) => {
          initial.set(s.id, {
            serviceId: s.id,
            quantity: 1,
            checked: false,
          });
        });
        setSelectedServices(initial);
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const allImages = venue?.images || [];
  const styleImages = venue?.styleImages || [];
  const styleNames = useMemo(() => {
    const names = new Set<string>();
    styleImages.forEach((s) => names.add(s.name));
    return Array.from(names);
  }, [styleImages]);

  const currentStyleImages = useMemo(() => {
    if (styleNames.length === 0) return [];
    const name = styleNames[activeStyleTab];
    return styleImages.filter((s) => s.name === name);
  }, [styleImages, styleNames, activeStyleTab]);

  const getPriceConfigForDate = (dateStr: string) => {
    return priceConfigs.find(
      (p) => p.date === dateStr && p.timeSlot === timeSlot
    );
  };

  const getVenuePrice = (dateStr: string) => {
    const config = getPriceConfigForDate(dateStr);
    if (config) return config.price;
    return venue?.basePrice || 0;
  };

  const servicesTotal = useMemo(() => {
    let total = 0;
    selectedServices.forEach((item) => {
      if (!item.checked) return;
      const svc = services.find((s) => s.id === item.serviceId);
      if (svc) total += svc.price * item.quantity;
    });
    return total;
  }, [selectedServices, services]);

  const currentVenuePrice = selectedDate ? getVenuePrice(selectedDate) : 0;
  const totalAmount = currentVenuePrice + servicesTotal;
  const deposit = Math.round(totalAmount * 0.3);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const cells: {
      day: number;
      date: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      isHoliday: boolean;
      isBooked: boolean;
      isSelected: boolean;
      price: number;
      config?: PriceConfig;
    }[] = [];

    const today = new Date();
    const todayStr = formatDate(today);

    for (let i = 0; i < firstDay; i++) {
      const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);
      const day = prevDaysInMonth - firstDay + i + 1;
      const date = new Date(prevYear, prevMonth, day);
      const dateStr = formatDate(date);
      cells.push({
        day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false,
        isBooked: false,
        isSelected: false,
        price: getVenuePrice(dateStr),
      });
    }

    const isSlotBookedForDate = (dateStr: string, slot: TimeSlot): boolean => {
      const slotsForDate = bookedSlots.get(dateStr);
      if (!slotsForDate) return false;
      if (slotsForDate.has('fullDay')) return true;
      if (slot === 'fullDay') return slotsForDate.size > 0;
      return slotsForDate.has(slot);
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const dateStr = formatDate(date);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const config = priceConfigs.find(
        (p) => p.date === dateStr && p.timeSlot === timeSlot
      );
      const isHoliday = !!config?.isHoliday;
      const priceCfgBooked = config?.price === -1;
      const realBooked = isSlotBookedForDate(dateStr, timeSlot);
      const isBooked = priceCfgBooked || realBooked;
      cells.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend,
        isHoliday,
        isBooked,
        isSelected: dateStr === selectedDate,
        price: isBooked ? -1 : getVenuePrice(dateStr),
        config,
      });
    }

    const remaining = 42 - cells.length;
    for (let i = 0; i < remaining; i++) {
      const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const day = i + 1;
      const date = new Date(nextYear, nextMonth, day);
      const dateStr = formatDate(date);
      cells.push({
        day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false,
        isBooked: false,
        isSelected: false,
        price: getVenuePrice(dateStr),
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, selectedDate, priceConfigs, timeSlot, venue]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const next = new Map(prev);
      const item = next.get(serviceId);
      if (item) {
        next.set(serviceId, { ...item, checked: !item.checked });
      }
      return next;
    });
  };

  const updateServiceQuantity = (serviceId: string, delta: number) => {
    setSelectedServices((prev) => {
      const next = new Map(prev);
      const item = next.get(serviceId);
      if (item) {
        const newQty = Math.max(1, item.quantity + delta);
        next.set(serviceId, { ...item, quantity: newQty });
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!token || !user) {
      setSubmitMessage({ type: 'error', text: '请先登录后再预订' });
      return;
    }
    if (!id) return;
    if (!selectedDate) {
      setSubmitMessage({ type: 'error', text: '请选择日期' });
      return;
    }
    if (estimatedPeople <= 0) {
      setSubmitMessage({ type: 'error', text: '请输入有效人数' });
      return;
    }
    if (venue && estimatedPeople > venue.capacity) {
      setSubmitMessage({ type: 'error', text: `预估人数(${estimatedPeople}人)超过场地最大容量(${venue.capacity}人)` });
      return;
    }

    const slotsForDate = selectedDate ? bookedSlots.get(selectedDate) : undefined;
    const hasFullDay = slotsForDate?.has('fullDay');
    let slotLocked = false;
    if (hasFullDay) {
      slotLocked = true;
    } else if (slotsForDate) {
      if (timeSlot === 'fullDay') {
        slotLocked = slotsForDate.size > 0;
      } else {
        slotLocked = slotsForDate.has(timeSlot);
      }
    }
    if (slotLocked) {
      setSubmitMessage({ type: 'error', text: '该日期时段已被预订，请选择其他日期或时段。' });
      return;
    }

    const svcList: SelectedService[] = [];
    selectedServices.forEach((item) => {
      if (item.checked) {
        svcList.push({ serviceId: item.serviceId, quantity: item.quantity });
      }
    });

    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await bookingsApi.createBooking({
        venueId: id,
        date: selectedDate,
        timeSlot,
        eventType,
        estimatedPeople,
        specialRequirements: specialRequirements || undefined,
        selectedServices: svcList,
      });
      if (res.success) {
        setSubmitMessage({
          type: 'success',
          text: '预订提交成功！请等待场地方审核。',
        });
      } else {
        setSubmitMessage({ type: 'error', text: res.message || '提交失败' });
      }
    } catch (e) {
      setSubmitMessage({
        type: 'error',
        text: e instanceof Error ? e.message : '提交失败',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-gray-700 mb-4">{error || '场地不存在'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* 1. 图集展示区 */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group">
                  {allImages[mainImageIndex] ? (
                    <img
                      src={allImages[mainImageIndex]}
                      alt={`${venue.name} ${mainImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Maximize className="w-12 h-12" />
                    </div>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setMainImageIndex(
                            mainImageIndex === 0
                              ? allImages.length - 1
                              : mainImageIndex - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setMainImageIndex(
                            mainImageIndex === allImages.length - 1
                              ? 0
                              : mainImageIndex + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-md">
                        {mainImageIndex + 1}/{allImages.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="w-40 flex flex-col gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const imgIdx = idx;
                    const hasImg = allImages[imgIdx];
                    return (
                      <button
                        key={idx}
                        onClick={() => hasImg && setMainImageIndex(imgIdx)}
                        className={cn(
                          'flex-1 rounded-lg overflow-hidden bg-gray-100 border-2 transition-all',
                          mainImageIndex === imgIdx && hasImg
                            ? 'border-primary-500 shadow'
                            : 'border-transparent hover:border-gray-300'
                        )}
                        disabled={!hasImg}
                      >
                        {hasImg ? (
                          <img
                            src={hasImg}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {styleImages.length > 0 && (
                <div>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {styleNames.map((name, idx) => (
                      <button
                        key={name}
                        onClick={() => setActiveStyleTab(idx)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                          activeStyleTab === idx
                            ? 'bg-primary-600 text-white shadow'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentStyleImages.map((s, idx) => (
                      <div
                        key={`${s.url}-${idx}`}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={s.url}
                          alt={s.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 2. 基本信息区 */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                      {venue.name}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StarRating
                          value={venue.rating}
                          size="md"
                          readOnly
                          showValue
                        />
                        <span className="text-sm text-gray-500">
                          ({venue.reviewCount}条评价)
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                        {VENUE_TYPE_LABELS[venue.type]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">
                    {venue.city} · {venue.address}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LayoutGrid className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      场地面积
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {venue.area}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ㎡
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">
                      容纳人数
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {venue.capacity}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      人
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-amber-700 font-medium">
                      层高
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {venue.height || '-'}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      m
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  设施配置
                </h3>
                <div className="flex flex-wrap gap-2">
                  {venue.facilities.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  场地介绍
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {venue.description}
                </p>
              </div>
            </section>

            {/* 3. 价格日历区 */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                  场地价格
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                    工作日
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
                    周末
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                    节假日
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-300" />
                    已订
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-lg font-semibold text-gray-900">
                  {calendarYear} 年 {calendarMonth + 1} 月
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="text-center text-sm font-medium text-gray-400 py-2"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!cell.isBooked && cell.isCurrentMonth) {
                        setSelectedDate(cell.date);
                      }
                    }}
                    disabled={cell.isBooked || !cell.isCurrentMonth}
                    className={cn(
                      'aspect-square rounded-xl p-1 flex flex-col items-center justify-center text-xs transition-all border',
                      !cell.isCurrentMonth && 'opacity-40',
                      cell.isBooked &&
                        'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through',
                      !cell.isBooked &&
                        !cell.isSelected &&
                        cell.isCurrentMonth &&
                        cell.isHoliday &&
                        'bg-red-50 border-red-200 hover:bg-red-100',
                      !cell.isBooked &&
                        !cell.isSelected &&
                        cell.isCurrentMonth &&
                        !cell.isHoliday &&
                        cell.isWeekend &&
                        'bg-blue-50 border-blue-200 hover:bg-blue-100',
                      !cell.isBooked &&
                        !cell.isSelected &&
                        cell.isCurrentMonth &&
                        !cell.isHoliday &&
                        !cell.isWeekend &&
                        'bg-gray-50 border-gray-200 hover:bg-gray-100',
                      !cell.isBooked &&
                        cell.isSelected &&
                        'bg-primary-600 border-primary-600 text-white shadow-md',
                      cell.isToday &&
                        !cell.isSelected &&
                        !cell.isBooked &&
                        'ring-2 ring-primary-400 ring-offset-1'
                    )}
                  >
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        cell.isSelected ? 'text-white' : 'text-gray-900',
                        cell.isBooked && 'text-gray-400'
                      )}
                    >
                      {cell.day}
                    </span>
                    {cell.isCurrentMonth && !cell.isBooked && (
                      <span
                        className={cn(
                          'font-medium mt-0.5',
                          cell.isSelected ? 'text-white/90' : 'text-primary-700',
                          cell.isHoliday && !cell.isSelected && 'text-red-600'
                        )}
                      >
                        ¥{cell.price.toLocaleString()}
                      </span>
                    )}
                    {cell.isBooked && cell.isCurrentMonth && (
                      <span className="mt-0.5 text-gray-400">已订</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. 配套服务区 */}
            {services.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  配套服务<span className="text-sm font-normal text-gray-500 ml-2">（可选）</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((svc) => {
                    const item = selectedServices.get(svc.id);
                    const isChecked = item?.checked || false;
                    const qty = item?.quantity || 1;
                    return (
                      <div
                        key={svc.id}
                        className={cn(
                          'border rounded-xl p-4 transition-all',
                          isChecked
                            ? 'border-primary-500 bg-primary-50/30 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        )}
                      >
                        <div className="flex gap-4">
                          <label className="flex-shrink-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleService(svc.id)}
                              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </label>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mb-1.5">
                                  {SERVICE_CATEGORY_LABELS[svc.category]}
                                </span>
                                <h4 className="font-semibold text-gray-900">
                                  {svc.name}
                                </h4>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-primary-600">
                                  ¥{svc.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  /{svc.unit}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {svc.description}
                            </p>
                            <div className="flex items-center justify-between">
                              {svc.image && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={svc.image}
                                    alt={svc.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {isChecked && (
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    onClick={() =>
                                      updateServiceQuantity(svc.id, -1)
                                    }
                                    disabled={qty <= 1}
                                    className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-gray-900">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateServiceQuantity(svc.id, 1)
                                    }
                                    className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50"
                                  >
                                    <Plus className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 6. 评价区 */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                用户评价
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({reviews.length}条)
                </span>
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无评价
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {r.user?.avatar ? (
                            <img
                              src={r.user.avatar}
                              alt={r.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {r.user?.name || '匿名用户'}
                              </span>
                              <StarRating
                                value={r.rating}
                                size="sm"
                                readOnly
                                showValue
                              />
                            </div>
                            <span className="text-sm text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString(
                                'zh-CN'
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {r.content}
                          </p>
                          {r.hostReply && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="text-sm font-semibold text-primary-700 mb-1.5 flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                场地方回复
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {r.hostReply}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 5. 右侧预订表单（sticky） */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">起价</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary-600">
                      ¥{venue.basePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/场起</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      选择日期
                    </label>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      minDate={formatDate(new Date())}
                      placeholder="请选择日期"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      选择时段
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        Object.keys(TIME_SLOT_LABELS) as TimeSlot[]
                      ).map((slot) => {
                        const slotsForDate = selectedDate ? bookedSlots.get(selectedDate) : undefined;
                        const hasFullDay = slotsForDate?.has('fullDay');
                        let slotLocked = false;
                        if (hasFullDay) {
                          slotLocked = true;
                        } else if (slotsForDate) {
                          if (slot === 'fullDay') {
                            slotLocked = slotsForDate.size > 0;
                          } else {
                            slotLocked = slotsForDate.has(slot);
                          }
                        }
                        return (
                          <button
                            key={slot}
                            onClick={() => !slotLocked && setTimeSlot(slot)}
                            disabled={slotLocked}
                            className={cn(
                              'px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left relative',
                              slotLocked
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                : timeSlot === slot
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            )}
                          >
                            <div>{TIME_SLOT_LABELS[slot]}</div>
                            {slotLocked && (
                              <div className="text-[10px] text-red-500 font-medium mt-0.5">
                                已锁定
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedDate && (
                      <div className="text-xs text-gray-400 mt-1">请先选择日期以查看时段可用状态</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      活动类型
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      预估人数
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={venue.capacity}
                      value={estimatedPeople}
                      onChange={(e) =>
                        setEstimatedPeople(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-gray-900 focus:ring-2 outline-none transition-all',
                        estimatedPeople > venue.capacity
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                      )}
                    />
                    <div className={cn(
                      'text-xs mt-1',
                      estimatedPeople > venue.capacity ? 'text-red-500' : 'text-gray-400'
                    )}>
                      场地最大容纳 {venue.capacity} 人
                      {estimatedPeople > venue.capacity && ' · 当前人数已超出容量'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      特殊需求
                    </label>
                    <textarea
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      rows={3}
                      placeholder="如有特殊需求请在此说明..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                    />
                  </div>

                  {Array.from(selectedServices.values()).some(
                    (s) => s.checked
                  ) && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        已选服务
                      </div>
                      <div className="space-y-2">
                        {Array.from(selectedServices.values())
                          .filter((s) => s.checked)
                          .map((s) => {
                            const svc = services.find(
                              (x) => x.id === s.serviceId
                            );
                            if (!svc) return null;
                            return (
                              <div
                                key={s.serviceId}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-700">
                                  {svc.name} × {s.quantity}
                                </span>
                                <span className="font-medium text-gray-900">
                                  ¥
                                  {(svc.price * s.quantity).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">场地费</span>
                      <span className="font-medium text-gray-900">
                        {selectedDate
                          ? `¥${currentVenuePrice.toLocaleString()}`
                          : '未选日期'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">服务费</span>
                      <span className="font-medium text-gray-900">
                        ¥{servicesTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                      <span className="text-gray-700 font-medium">预估总价</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ¥{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-amber-50 rounded-lg px-3 py-2">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        需支付定金（30%）
                      </span>
                      <span className="font-semibold text-amber-700">
                        ¥{deposit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {submitMessage && (
                    <div
                      className={cn(
                        'px-4 py-3 rounded-lg text-sm',
                        submitMessage.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      )}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={cn(
                      'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg',
                      token
                        ? 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98] shadow-primary-200'
                        : 'bg-gray-600 hover:bg-gray-700',
                      submitting && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        提交中...
                      </span>
                    ) : token ? (
                      '提交预订'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        登录后预订
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
