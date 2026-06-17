import { useEffect, useState } from 'react';
import {
  Plus,
  Edit3,
  Tag,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Users,
  Maximize2,
  Star,
  Search,
  Filter,
  Image as ImageIcon,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { venuesApi } from '@/lib/api';
import {
  VENUE_TYPE_LABELS,
  type Venue,
  type VenueStatus,
} from '../../../shared/types';
import { cn } from '@/lib/utils';
import Modal from '@/components/Modal';

const statusConfig: Record<VenueStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: '草稿',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
  pending: {
    label: '审核中',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  published: {
    label: '已上架',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  offline: {
    label: '已下架',
    className: 'bg-red-50 text-red-600 border-red-200',
    dot: 'bg-red-400',
  },
};

export default function HostVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all');
  const [toggleModalVenue, setToggleModalVenue] = useState<Venue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const res = await venuesApi.getMyVenues();
      if (res.success && res.data) {
        setVenues(res.data);
      }
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const filteredVenues = venues.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = async () => {
    if (!toggleModalVenue) return;
    setSubmitting(true);
    try {
      const newStatus: VenueStatus =
        toggleModalVenue.status === 'published' ? 'offline' : 'published';
      const res = await venuesApi.updateVenue(toggleModalVenue.id, {
        status: newStatus,
      } as Partial<Venue>);
      if (res.success) {
        showToast(
          newStatus === 'published' ? '场地已上架' : '场地已下架',
          'success'
        );
        setToggleModalVenue(null);
        await loadVenues();
      } else {
        showToast(res.message || '操作失败，请重试', 'error');
      }
    } catch {
      showToast('操作失败，请重试', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: venues.length,
    published: venues.filter((v) => v.status === 'published').length,
    pending: venues.filter((v) => v.status === 'pending').length,
    offline: venues.filter((v) => v.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-display">场地管理</h1>
          <p className="text-gray-500 mt-1">管理您的所有场地，编辑信息、配置价格与上下架</p>
        </div>
        <button
          onClick={() => (window.location.href = '/host/venues/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          新增场地
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总场地数', value: stats.total, color: 'primary', icon: MapPin },
          { label: '已上架', value: stats.published, color: 'emerald', icon: ToggleRight },
          { label: '审核中', value: stats.pending, color: 'amber', icon: AlertCircle },
          { label: '已下架', value: stats.offline, color: 'gray', icon: ToggleLeft },
        ].map((item, idx) => {
          const Icon = item.icon;
          const colorMap: Record<string, string> = {
            primary: 'bg-primary-50 text-primary-600',
            emerald: 'bg-emerald-50 text-emerald-600',
            amber: 'bg-amber-50 text-amber-600',
            gray: 'bg-gray-100 text-gray-500',
          };
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow-card border border-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-primary-900 font-display mt-1">
                    {item.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    colorMap[item.color]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索场地名称/城市/地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VenueStatus | 'all')}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
            >
              <option value="all">全部状态</option>
              <option value="published">已上架</option>
              <option value="pending">审核中</option>
              <option value="offline">已下架</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">暂无场地</h3>
              <p className="text-gray-400 mt-2 text-sm">
                {searchQuery
                  ? '没有找到匹配的场地，请尝试其他关键词'
                  : '您还没有创建任何场地，点击右上角开始创建'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => (window.location.href = '/host/venues/new')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  创建第一个场地
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVenues.map((venue) => {
                const status = statusConfig[venue.status];
                return (
                  <div
                    key={venue.id}
                    className="group rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      {venue.images?.[0] ? (
                        <img
                          src={venue.images[0]}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                          <ImageIcon className="w-14 h-14" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 backdrop-blur-sm',
                            status.className
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
                        <Star className="w-3 h-3 fill-accent-gold text-accent-gold" />
                        {venue.rating.toFixed(1)}
                        <span className="text-white/60 ml-0.5">({venue.reviewCount})</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <div className="flex items-baseline justify-between">
                          <div className="text-white">
                            <span className="text-xs opacity-80">起价</span>
                            <div className="text-xl font-bold font-display">
                              ¥{venue.basePrice.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-white/80">
                            {VENUE_TYPE_LABELS[venue.type]}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-primary-900 text-lg truncate mb-2 group-hover:text-primary-700 transition-colors">
                        {venue.name}
                      </h3>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {venue.city} · {venue.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{venue.capacity}人</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-4 h-4 text-gray-400" />
                            <span>{venue.area}㎡</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/host/venues/${venue.id}/edit`)
                          }
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/host/venues/${venue.id}/pricing`)
                          }
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-accent-gold/20 text-accent-goldDark hover:bg-accent-gold/30 transition-colors"
                        >
                          <Tag className="w-4 h-4" />
                          价格
                        </button>
                        <button
                          onClick={() => (window.location.href = `/venues/${venue.id}`)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          预览
                        </button>
                        <button
                          onClick={() => setToggleModalVenue(venue)}
                          disabled={venue.status === 'draft' || venue.status === 'pending'}
                          className={cn(
                            'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                            venue.status === 'published'
                              ? 'border border-red-200 text-red-600 hover:bg-red-50'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                          )}
                        >
                          {venue.status === 'published' ? (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              下架
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              上架
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!toggleModalVenue}
        onClose={() => setToggleModalVenue(null)}
        title={toggleModalVenue?.status === 'published' ? '确认下架场地' : '确认上架场地'}
        description={`${toggleModalVenue?.status === 'published' ? '下架后用户将无法搜索和预订该场地' : '上架后该场地将对用户可见并可接受预订'}：${toggleModalVenue?.name}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setToggleModalVenue(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={submitting}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 shadow-sm',
                toggleModalVenue?.status === 'published'
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
              )}
            >
              {submitting
                ? '提交中...'
                : toggleModalVenue?.status === 'published'
                ? '确认下架'
                : '确认上架'}
            </button>
          </div>
        }
      >
        <div
          className={cn(
            'p-4 rounded-xl border',
            toggleModalVenue?.status === 'published'
              ? 'bg-red-50 border-red-100'
              : 'bg-emerald-50 border-emerald-100'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                toggleModalVenue?.status === 'published'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              )}
            >
              {toggleModalVenue?.status === 'published' ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <ToggleRight className="w-5 h-5" />
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-1">操作确认</p>
              <p className="text-gray-600">
                {toggleModalVenue?.status === 'published'
                  ? '下架场地不会删除已有的订单，历史订单数据仍可在订单管理中查看。'
                  : '上架场地后，您需要及时关注新的预订申请并处理审核。'}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {toast && (
        <div
          className={cn(
            'fixed bottom-8 right-8 z-[200] px-5 py-3 rounded-xl shadow-floating animate-fade-in-up flex items-center gap-2 text-sm font-medium',
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          )}
        >
          {toast.type === 'success' ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
