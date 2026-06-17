import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Calendar as CalendarIcon,
  Activity,
  Building2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import {
  type BookingRateData,
  type RevenueData,
  type RevenueSummary,
  type EventTypeData,
  type MonthlyRevenueData,
} from '../../../shared/types';
import { cn } from '@/lib/utils';

const COLORS = ['#1E3A5F', '#D4AF37', '#FF6B35', '#416DAA', '#8DA8CC', '#B8942E'];
const VENUE_COLOR = '#1E3A5F';
const SERVICE_COLOR = '#D4AF37';

interface HostOverviewData {
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  color,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  color: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      'bg-white rounded-2xl p-5 shadow-card border border-gray-50 transition-all',
      highlight && 'ring-2 ring-primary-100 bg-gradient-to-br from-primary-50/30 to-white'
    )}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="mt-2 flex items-baseline gap-1">
          {prefix && <span className="text-lg text-gray-600 font-medium">{prefix}</span>}
          <span
            className={cn(
              'text-2xl font-bold font-display',
              highlight ? 'text-primary-700' : 'text-primary-900'
            )}
          >
            {value}
          </span>
          {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
        </div>
      </div>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default function HostAnalytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<HostOverviewData>({
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [bookingRate, setBookingRate] = useState<BookingRateData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypeData[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [overviewRes, monthlyRes, rateRes, revenueRes, summaryRes, eventsRes] = await Promise.all([
          analyticsApi.getHostOverview(),
          analyticsApi.getMonthlyRevenue(),
          analyticsApi.getBookingRate(),
          analyticsApi.getRevenue(),
          analyticsApi.getRevenueSummary({ months: 6 }),
          analyticsApi.getEventTypes(),
        ]);

        if (overviewRes.success && overviewRes.data) {
          setOverview(overviewRes.data);
        }
        if (monthlyRes.success && monthlyRes.data) {
          setMonthlyRevenue(monthlyRes.data);
        }
        if (rateRes.success && rateRes.data) {
          setBookingRate(rateRes.data);
        }
        if (revenueRes.success && revenueRes.data) {
          setRevenueData(revenueRes.data);
        }
        if (summaryRes.success && summaryRes.data) {
          setRevenueSummary(summaryRes.data);
        }
        if (eventsRes.success && eventsRes.data) {
          setEventTypes(eventsRes.data);
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const pieData =
    revenueData.length > 0
      ? revenueData.map((item) => ({
          name: item.source === 'venue' ? '场地收入' : '服务收入',
          value: item.amount,
          percentage: item.percentage,
        }))
      : [
          { name: '场地收入', value: 0, percentage: 70 },
          { name: '服务收入', value: 0, percentage: 30 },
        ];

  const eventChartData = eventTypes.length > 0
    ? eventTypes
    : [
        { type: '婚礼婚宴', count: 0, percentage: 0 },
        { type: '企业年会', count: 0, percentage: 0 },
        { type: '产品发布会', count: 0, percentage: 0 },
        { type: '展览展会', count: 0, percentage: 0 },
        { type: '学术会议', count: 0, percentage: 0 },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-display">数据分析</h1>
          <p className="text-gray-500 mt-1">深度分析您的业务数据，洞察运营趋势</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>数据更新时间：{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="平均评分"
          value={overview.avgRating > 0 ? overview.avgRating.toFixed(1) : '5.0'}
          suffix="分"
          color="bg-accent-gold/20 text-accent-goldDark"
        />
        <StatCard
          icon={Building2}
          label="总场地数"
          value={overview.totalVenues}
          suffix="个"
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={CalendarIcon}
          label="总订单数"
          value={overview.totalBookings}
          suffix="单"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={BarChart3}
          label="总收入"
          value={overview.totalRevenue.toLocaleString()}
          prefix="¥"
          color="bg-emerald-50 text-emerald-600"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          label="场地收入"
          value={revenueSummary?.totalVenueRevenue?.toLocaleString() || '0'}
          prefix="¥"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Sparkles}
          label="服务收入"
          value={revenueSummary?.totalServiceRevenue?.toLocaleString() || '0'}
          prefix="¥"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={TrendingUp}
          label="总收入（拆分）"
          value={revenueSummary?.totalRevenue?.toLocaleString() || '0'}
          prefix="¥"
          color="bg-emerald-50 text-emerald-600"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-primary-600" />
                月度收入与订单趋势
              </h3>
              <p className="text-sm text-gray-500 mt-1">全年收入与订单数变化（拆分场地/服务）</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VENUE_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={VENUE_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERVICE_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={SERVICE_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.12)',
                  }}
                  formatter={(value: number, name: string) => {
                    const labelMap: Record<string, string> = {
                      revenue: '总收入',
                      venueRevenue: '场地收入',
                      serviceRevenue: '服务收入',
                      bookings: '订单数',
                    };
                    return [
                      name === 'bookings' ? `${value} 单` : `¥${value.toLocaleString()}`,
                      labelMap[name] || name,
                    ];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="venueRevenue"
                  name="场地收入"
                  stackId="1"
                  stroke={VENUE_COLOR}
                  strokeWidth={2}
                  fill="url(#colorVenue)"
                />
                <Area
                  type="monotone"
                  dataKey="serviceRevenue"
                  name="服务收入"
                  stackId="1"
                  stroke={SERVICE_COLOR}
                  strokeWidth={2}
                  fill="url(#colorService)"
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="订单数"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  yAxisId={undefined}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-accent-goldDark" />
                收入来源分布
              </h3>
              <p className="text-sm text-gray-500 mt-1">场地与配套服务收入占比</p>
            </div>
          </div>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === '场地收入' ? VENUE_COLOR : SERVICE_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '金额']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.12)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4 pl-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.name === '场地收入' ? VENUE_COLOR : SERVICE_COLOR }}
                      />
                      <span className="text-sm text-gray-700 font-medium">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary-900">
                      {entry.percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 pl-5">
                    ¥{entry.value.toLocaleString()}
                  </div>
                </div>
              ))}
              {revenueSummary && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-900">总收入</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                      ¥{revenueSummary.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-emerald-600" />
                活动类型分布
              </h3>
              <p className="text-sm text-gray-500 mt-1">各类活动订单数量统计</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eventChartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.12)',
                  }}
                  formatter={(value: number) => [`${value} 单`, '数量']}
                />
                <Bar
                  dataKey="count"
                  name="订单数"
                  radius={[0, 8, 8, 0]}
                  fill="#1E3A5F"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                预订率趋势
              </h3>
              <p className="text-sm text-gray-500 mt-1">近期场地预订率变化</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={bookingRate}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.12)',
                  }}
                  formatter={(value: number) => [`${value}%`, '预订率']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="预订率"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 shadow-card text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-display">更多数据分析功能</h3>
            <p className="text-primary-100 mt-1 text-sm">
              详细的数据洞察报告正在开发中，敬请期待更多高级分析功能
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <PieChartIcon className="w-4 h-4" />
              <span className="text-sm">高级报表</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-gold/20 backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-accent-gold" />
              <span className="text-sm text-accent-goldLight">智能分析</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
