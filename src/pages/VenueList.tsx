import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Filter,
  X,
  ChevronDown,
  Loader2,
  Search,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useVenueStore } from '@/store/venueStore';
import VenueCard from '@/components/VenueCard';
import Pagination from '@/components/Pagination';
import DatePicker from '@/components/DatePicker';
import {
  CITIES,
  VENUE_TYPE_LABELS,
  FACILITIES,
  type VenueType,
  type VenueFilterParams,
} from '@/../shared/types';

type SortOption = 'rating' | 'price-asc' | 'price-desc' | 'bookings' | 'area';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: '按评分' },
  { value: 'price-asc', label: '按价格（低到高）' },
  { value: 'price-desc', label: '按价格（高到低）' },
  { value: 'bookings', label: '按预订量（热度）' },
  { value: 'area', label: '按面积' },
];

const PAGE_SIZE = 9;

export default function VenueList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { venues, loading, total, fetchVenues } = useVenueStore();

  const [cities, setCities] = useState<string[]>(() => {
    const city = searchParams.get('city');
    return city ? [city] : [];
  });
  const [venueTypes, setVenueTypes] = useState<VenueType[]>(() => {
    const type = searchParams.get('type') as VenueType | null;
    return type ? [type] : [];
  });
  const [minPrice, setMinPrice] = useState<string>(() => searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(() => searchParams.get('maxPrice') || '');
  const [minCapacity, setMinCapacity] = useState<string>(() => searchParams.get('minCapacity') || '');
  const [maxCapacity, setMaxCapacity] = useState<string>(() => searchParams.get('maxCapacity') || '');
  const [date, setDate] = useState<string>(() => searchParams.get('date') || '');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [keyword, setKeyword] = useState('');

  const toggleCity = (city: string) => {
    setCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
    setCurrentPage(1);
  };

  const toggleVenueType = (type: VenueType) => {
    setVenueTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
    setCurrentPage(1);
  };

  const handleReset = () => {
    setCities([]);
    setVenueTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setMinCapacity('');
    setMaxCapacity('');
    setDate('');
    setFacilities([]);
    setCurrentPage(1);
  };

  const sortConfig = useMemo((): {
    sortBy: VenueFilterParams['sortBy'];
    sortOrder: VenueFilterParams['sortOrder'];
  } => {
    switch (sortBy) {
      case 'price-asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'bookings':
        return { sortBy: 'bookings', sortOrder: 'desc' };
      case 'area':
        return { sortBy: 'area', sortOrder: 'desc' };
      case 'rating':
      default:
        return { sortBy: 'rating', sortOrder: 'desc' };
    }
  }, [sortBy]);

  const filterParams = useMemo(() => {
    const params: VenueFilterParams & { page: number; pageSize: number; facilities?: string[] } = {
      page: currentPage,
      pageSize: PAGE_SIZE,
      city: cities.length === 1 ? cities[0] : undefined,
      type: venueTypes.length === 1 ? venueTypes[0] : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minCapacity: minCapacity ? Number(minCapacity) : undefined,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      date: date || undefined,
      facilities: facilities.length > 0 ? facilities : undefined,
      keyword: keyword || undefined,
      sortBy: sortConfig.sortBy,
      sortOrder: sortConfig.sortOrder,
    };
    return params;
  }, [cities, venueTypes, minPrice, maxPrice, minCapacity, maxCapacity, date, facilities, keyword, sortConfig, currentPage]);

  useEffect(() => {
    fetchVenues(filterParams);
  }, [fetchVenues, filterParams]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasActiveFilters =
    cities.length > 0 ||
    venueTypes.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minCapacity !== '' ||
    maxCapacity !== '' ||
    date !== '' ||
    facilities.length > 0;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">筛选条件</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            重置
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">城市</label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  cities.includes(city)
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">场地类型</label>
          <div className="space-y-2">
            {(Object.keys(VENUE_TYPE_LABELS) as VenueType[]).map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={venueTypes.includes(type)}
                  onChange={() => toggleVenueType(type)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {VENUE_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">价格区间（元/场）</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="最低价"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            <span className="text-gray-400 text-sm flex-shrink-0">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="最高价"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">容量区间（人）</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minCapacity}
              onChange={(e) => {
                setMinCapacity(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="最少"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            <span className="text-gray-400 text-sm flex-shrink-0">-</span>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => {
                setMaxCapacity(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="最多"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">活动日期</label>
          <DatePicker
            value={date}
            onChange={(val) => {
              setDate(val);
              setCurrentPage(1);
            }}
            placeholder="选择日期"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">设施配置</label>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((facility) => (
              <button
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border ${
                  facilities.includes(facility)
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 lg:hidden">
          <button
            onClick={() => setShowMobileFilter(false)}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
          >
            应用筛选
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">场地列表</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="搜索场地名称、地址..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-gray-300 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                筛选
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium outline-none cursor-pointer hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              找到 <span className="font-semibold text-gray-900">{total}</span> 个场地
            </p>
            {hasActiveFilters && (
              <div className="hidden sm:flex flex-wrap gap-2">
                {cities.map((c) => (
                  <span
                    key={`city-${c}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium"
                  >
                    {c}
                    <button
                      onClick={() => toggleCity(c)}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {venueTypes.map((t) => (
                  <span
                    key={`type-${t}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium"
                  >
                    {VENUE_TYPE_LABELS[t]}
                    <button
                      onClick={() => toggleVenueType(t)}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
                    ¥{minPrice || '0'} - ¥{maxPrice || '不限'}
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setCurrentPage(1);
                      }}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minCapacity || maxCapacity) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
                    {minCapacity || '0'} - {maxCapacity || '不限'} 人
                    <button
                      onClick={() => {
                        setMinCapacity('');
                        setMaxCapacity('');
                        setCurrentPage(1);
                      }}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {date && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
                    {date}
                    <button
                      onClick={() => {
                        setDate('');
                        setCurrentPage(1);
                      }}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {facilities.map((f) => (
                  <span
                    key={`facility-${f}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium"
                  >
                    {f}
                    <button
                      onClick={() => toggleFacility(f)}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-40 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
              <FilterSidebar />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <span className="ml-4 text-gray-500 text-lg">加载中...</span>
              </div>
            ) : venues.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无符合条件的场地</h3>
                <p className="text-gray-500 mb-6">尝试调整筛选条件或清除部分条件</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  清除所有筛选
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 mb-8">
                  {venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showTotal
                    totalItems={total}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">筛选条件</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
