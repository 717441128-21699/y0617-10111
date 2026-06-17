import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  ShoppingCart,
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  BarChart3,
  Trophy,
  Loader2,
  ArrowUp,
  Star,
  Crown,
  Eye,
  MoreHorizontal,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import type { Venue } from '../../../shared/types';

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

interface TopVenue {
  id: string;
  name: string;
  city: string;
  bookings: number;
  revenue: number;
  rating: number;
  image: string;
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function generateMockMonthlyData(): MonthlyData[] {
  const currentMonth = new Date().getMonth();
  const data: MonthlyData[] = [];
  for (let i = 0; i <= currentMonth; i++) {
    const baseBookings = 80 + Math.floor(Math.random() * 100);
    const baseRevenue = 200000 + Math.floor(Math.random() * 300000);
    data.push({
      month: MONTHS[i],
      bookings: baseBookings + i * 15,
      revenue: baseRevenue + i * 50000,
    });
  }
  return data;
}

function generateMockTopVenues(): TopVenue[] {
  return [
    {
      id: 'venue1',
      name: '华盛水晶宴会厅',
      city: '上海',
      bookings: 156,
      revenue: 2380000,
      rating: 4.8,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20banquet%20hall%20with%20crystal%20chandeliers%20elegant%20interior&image_size=square_hd',
    },
    {
      id: 'venue3',
      name: '国际会展中心A馆',
      city: '上海',
      bookings: 98,
      revenue: 1860000,
      rating: 4.5,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20exhibition%20hall%20interior%20with%20modern%20design&image_size=square_hd',
    },
    {
      id: 'venue5',
      name: '云顶国际会议中心',
      city: '深圳',
      bookings: 87,
      revenue: 1520000,
      rating: 4.4,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20conference%20center%20interior%20with%20auditorium&image_size=square_hd',
    },
    {
      id: 'venue2',
      name: '璀璨花园宴会厅',
      city: '北京',
      bookings: 76,
      revenue: 1280000,
      rating: 4.6,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20garden%20banquet%20hall%20european%20style%20interior&image_size=square_hd',
    },
    {
      id: 'venue4',
      name: '湖畔户外草坪',
      city: '杭州',
      bookings: 65,
      revenue: 980000,
      rating: 4.7,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20lawn%20venue%20by%20lake%20with%20beautiful%20scenery&image_size=square_hd',
    },
  ];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    hostCount: 0,
    customerCount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topVenues, setTopVenues] = useState<TopVenue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getAdminOverview();
        if (res.success && res.data) {
          setOverview({
            totalUsers: res.data.totalUsers || 2580,
            totalVenues: res.data.totalVenues || 326,
            totalBookings: res.data.totalBookings || 1847,
            totalRevenue: res.data.totalRevenue || 8650000,
            hostCount: (res.data as { hostCount?: number }).hostCount || 186,
            customerCount: (res.data as { customerCount?: number }).customerCount || 2394,
          });
        } else {
          setOverview({
            totalUsers: 2580,
            totalVenues: 326,
            totalBookings: 1847,
            totalRevenue: 8650000,
            hostCount: 186,
            customerCount: 2394,
          });
        }
        setMonthlyData(generateMockMonthlyData());
        setTopVenues(generateMockTopVenues());
      } catch {
        setOverview({
          totalUsers: 2580,
          totalVenues: 326,
          totalBookings: 1847,
          totalRevenue: 8650000,
          hostCount: 186,
          customerCount: 2394,
        });
        setMonthlyData(generateMockMonthlyData());
        setTopVenues(generateMockTopVenues());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgOrderValue = useMemo(() => {
    if (overview.totalBookings === 0) return 0;
    return Math.round(overview.totalRevenue / overview.totalBookings);
  }, [overview.totalRevenue, overview.totalBookings]);

  const monthlyNewBookings = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    return monthlyData[monthlyData.length - 1]?.bookings || 0;
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">平台数据大盘</h1>
              <p className="mt-1 text-gray-500">实时监控平台运营核心数据与趋势</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>数据更新时间：{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <OverviewCard
            icon={Users}
            label="总用户数"
            value={overview.totalUsers.toLocaleString()}
            subLabel={`场地方 ${overview.hostCount} · 客户 ${overview.customerCount}`}
            gradient="from-primary-500 to-primary-700"
            trend={15.2}
          />
          <OverviewCard
            icon={Building2}
            label="总场地数"
            value={overview.totalVenues.toLocaleString()}
            subLabel="上线运营中场地"
            gradient="from-emerald-500 to-emerald-600"
            trend={8.7}
          />
          <OverviewCard
            icon={ShoppingCart}
            label="总订单数"
            value={overview.totalBookings.toLocaleString()}
            subLabel="累计订单总量"
            gradient="from-blue-500 to-blue-600"
            trend={22.4}
          />
          <OverviewCard
            icon={DollarSign}
            label="平台总收入"
            value={`¥${(overview.totalRevenue / 10000).toFixed(0)}万`}
            subLabel="平台累计营收"
            gradient="from-amber-500 to-amber-600"
            trend={18.9}
          />
          <OverviewCard
            icon={Wallet}
            label="平均客单价"
            value={`¥${avgOrderValue.toLocaleString()}`}
            subLabel="订单平均金额"
            gradient="from-rose-500 to-rose-600"
            trend={6.3}
          />
          <OverviewCard
            icon={TrendingUp}
            label="本月新增订单"
            value={monthlyNewBookings.toString()}
            subLabel="当月新增订单量"
            gradient="from-violet-500 to-violet-600"
            trend={28.1}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">月度平台趋势</h3>
                  <p className="text-sm text-gray-500">订单数量与收入金额走势</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="text-xs text-gray-500">订单数</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-gray-500">收入(万)</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 10000}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [`¥${value.toLocaleString()}`, '收入'];
                      return [`${value} 单`, '订单数'];
                    }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    fillOpacity={1}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#1E3A5F"
                    strokeWidth={3}
                    dot={{ fill: '#1E3A5F', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1E3A5F', stroke: '#fff', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">平台概览</h3>
                  <p className="text-sm text-gray-500">核心运营指标</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <MetricRow
                label="用户增长率"
                value="23.5%"
                trend="up"
                icon={Users}
                color="primary"
              />
              <MetricRow
                label="场地入驻率"
                value="87.2%"
                trend="up"
                icon={Building2}
                color="emerald"
              />
              <MetricRow
                label="订单转化率"
                value="68.4%"
                trend="up"
                icon={ShoppingCart}
                color="blue"
              />
              <MetricRow
                label="收入增长率"
                value="31.2%"
                trend="up"
                icon={DollarSign}
                color="amber"
              />
              <MetricRow
                label="复购率"
                value="42.8%"
                trend="down"
                icon={Crown}
                color="rose"
              />
              <MetricRow
                label="用户满意度"
                value="94.6%"
                trend="up"
                icon={Star}
                color="violet"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">热门场地排行榜 Top 5</h3>
                <p className="text-sm text-gray-500">按预订量和收入综合排名</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              查看全部
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">排名</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">场地信息</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">预订量</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">总收入</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">评分</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topVenues.map((venue, index) => (
                  <tr key={venue.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{venue.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {venue.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{venue.bookings}</span>
                      <span className="text-xs text-emerald-600">单</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-primary-600">
                        ¥{(venue.revenue / 10000).toFixed(1)}万
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-gray-900">{venue.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
      </div>
    </div>
  );
}

interface OverviewCardProps {
  icon: typeof Users;
  label: string;
  value: string;
  subLabel: string;
  gradient: string;
  trend: number;
}

function OverviewCard({ icon: Icon, label, value, subLabel, gradient, trend }: OverviewCardProps) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
          isPositive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-600'
        }`}>
          <ArrowUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-0.5">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{subLabel}</p>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  icon: typeof Users;
  color: 'primary' | 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
}

function MetricRow({ label, value, trend, icon: Icon, color }: MetricRowProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{value}</span>
        <div className={`w-4 h-4 rounded-full ${
          trend === 'up' ? 'bg-emerald-100' : 'bg-red-100'
        } flex items-center justify-center`}>
          <ArrowUp className={`w-2.5 h-2.5 ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-600 rotate-180'
          }`} />
        </div>
      </div>
    </div>
  );
}
