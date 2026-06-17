import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  Sparkles,
  Building2,
  Palmtree,
  Presentation,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { useVenueStore } from '@/store/venueStore';
import VenueCard from '@/components/VenueCard';
import DatePicker from '@/components/DatePicker';
import { CITIES, VENUE_TYPE_LABELS, type VenueType } from '../../shared/types';

const VENUE_TYPES: { type: VenueType; icon: typeof Building2; gradient: string }[] = [
  { type: 'banquet', icon: UtensilsCrossed, gradient: 'from-amber-400 to-orange-500' },
  { type: 'exhibition', icon: Building2, gradient: 'from-blue-400 to-indigo-500' },
  { type: 'outdoor', icon: Palmtree, gradient: 'from-emerald-400 to-green-500' },
  { type: 'conference', icon: Presentation, gradient: 'from-rose-400 to-pink-500' },
];

export default function Home() {
  const navigate = useNavigate();
  const { venues, loading, total, fetchVenues } = useVenueStore();

  const [searchCity, setSearchCity] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPeople, setSearchPeople] = useState('');

  const [filterCity, setFilterCity] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(1000);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filterDate, setFilterDate] = useState('');

  const homeFilters = useMemo(
    () => ({
      city: filterCity || undefined,
      minCapacity: minCapacity > 0 ? minCapacity : undefined,
      maxCapacity: maxCapacity < 1000 ? maxCapacity : undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 100000 ? maxPrice : undefined,
      date: filterDate || undefined,
      page: 1,
      pageSize: 8,
    }),
    [filterCity, minCapacity, maxCapacity, minPrice, maxPrice, filterDate]
  );

  useEffect(() => {
    fetchVenues(homeFilters);
  }, [fetchVenues, homeFilters]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchDate) params.set('date', searchDate);
    if (searchPeople) params.set('minCapacity', searchPeople);
    navigate(`/venues?${params.toString()}`);
  };

  const handleTypeClick = (type: VenueType) => {
    navigate(`/venues?type=${type}`);
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[620px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-coral" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,215,0,0.15),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-gold/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span>全国精选 10000+ 优质场地</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            找到理想场地，
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-accent-gold to-amber-200 bg-clip-text text-transparent">
              办一场完美活动
            </span>
          </h1>

          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            婚礼、会议、展览、派对...一站式场地预订平台，轻松找到您的完美之选
          </p>

          <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-none sm:rounded-l-xl bg-gray-50 sm:bg-transparent sm:border-r sm:border-gray-200">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div className="relative flex-1">
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full appearance-none bg-transparent text-gray-900 text-sm sm:text-base outline-none pr-6 py-1 cursor-pointer"
                  >
                    <option value="">选择城市</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-gray-50 sm:bg-transparent sm:border-r sm:border-gray-200">
                <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <DatePicker
                  value={searchDate}
                  onChange={setSearchDate}
                  placeholder="选择日期"
                  className="flex-1"
                  inputClassName="!border-0 !bg-transparent !shadow-none !p-0"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-gray-50 sm:bg-transparent">
                <Users className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <input
                  type="number"
                  value={searchPeople}
                  onChange={(e) => setSearchPeople(e.target.value)}
                  placeholder="预计人数"
                  min="1"
                  className="flex-1 w-full bg-transparent text-gray-900 text-sm sm:text-base placeholder-gray-400 outline-none py-1"
                />
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-0 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl sm:rounded-r-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                <span>搜索</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">按场地类型快速筛选</h2>
            <p className="text-gray-500">选择适合您活动类型的场地</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {VENUE_TYPES.map(({ type, icon: Icon, gradient }) => (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg group-hover:scale-110 group-hover:bg-white/20 group-hover:bg-none transition-all duration-300`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors mb-1">
                    {VENUE_TYPE_LABELS[type]}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                    点击查看全部
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">热门场地推荐</h2>
              <p className="text-gray-500">
                为您精选优质场地
                {total > 0 && (
                  <span className="ml-2 text-primary-600 font-medium">共 {total} 个</span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/venues')}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              查看全部
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                <div className="relative">
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none pr-10 cursor-pointer hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  >
                    <option value="">全部城市</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  容量范围：{minCapacity} - {maxCapacity} 人
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(Math.max(0, Number(e.target.value)))}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Math.max(0, Number(e.target.value)))}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格范围：¥{minPrice.toLocaleString()} - ¥{maxPrice.toLocaleString()}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <DatePicker
                  value={filterDate}
                  onChange={setFilterDate}
                  placeholder="选择日期"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <span className="ml-3 text-gray-500">加载中...</span>
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg mb-2">暂无符合条件的场地</p>
              <p className="text-gray-400 text-sm">试试调整筛选条件吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
