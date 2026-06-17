import type { ReactNode } from 'react';
import {
  Search,
  CalendarX,
  Heart,
  Package,
  FileText,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyType = 'default' | 'search' | 'booking' | 'favorite' | 'order' | 'data' | 'message';

interface EmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const typeConfig: Record<EmptyType, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <Inbox className="w-full h-full" />,
    title: '暂无数据',
    description: '这里还没有任何内容，稍后再来看看吧',
  },
  search: {
    icon: <Search className="w-full h-full" />,
    title: '未找到相关结果',
    description: '尝试调整搜索关键词或筛选条件',
  },
  booking: {
    icon: <CalendarX className="w-full h-full" />,
    title: '暂无预订记录',
    description: '去发现更多精彩场地，开启您的活动之旅',
  },
  favorite: {
    icon: <Heart className="w-full h-full" />,
    title: '还没有收藏',
    description: '收藏您喜欢的场地，方便随时查看',
  },
  order: {
    icon: <Package className="w-full h-full" />,
    title: '暂无订单',
    description: '您还没有任何订单记录',
  },
  data: {
    icon: <FileText className="w-full h-full" />,
    title: '暂无数据',
    description: '当前没有可展示的数据',
  },
  message: {
    icon: <Inbox className="w-full h-full" />,
    title: '暂无消息',
    description: '您的收件箱空空如也',
  },
};

const sizeConfig = {
  sm: {
    wrapper: 'py-8',
    iconBox: 'w-16 h-16',
    title: 'text-base',
    description: 'text-xs',
  },
  md: {
    wrapper: 'py-12',
    iconBox: 'w-24 h-24',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-20',
    iconBox: 'w-32 h-32',
    title: 'text-xl',
    description: 'text-base',
  },
};

export default function Empty({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
  size = 'md',
}: EmptyProps) {
  const config = typeConfig[type];
  const sizes = sizeConfig[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizes.wrapper,
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary-50 to-gray-50 flex items-center justify-center mb-5',
          'border border-primary-100/50',
          sizes.iconBox
        )}
      >
        <div className={cn(
          'text-primary-400',
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
        )}>
          {icon || config.icon}
        </div>
      </div>

      <h3 className={cn('font-semibold text-gray-800 mb-2', sizes.title)}>
        {title || config.title}
      </h3>

      <p className={cn('text-gray-500 max-w-xs mb-6 leading-relaxed', sizes.description)}>
        {description || config.description}
      </p>

      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
