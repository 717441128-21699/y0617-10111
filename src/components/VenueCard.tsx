import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  Maximize2,
  Star,
  ArrowRight,
} from 'lucide-react';
import type { Venue } from '../../shared/types';
import { VENUE_TYPE_LABELS } from '../../shared/types';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
  onViewDetail?: (venue: Venue) => void;
  className?: string;
}

const VENUE_TYPE_COLORS: Record<string, string> = {
  banquet: 'bg-accent-gold/90 text-white',
  exhibition: 'bg-primary-500 text-white',
  outdoor: 'bg-green-500 text-white',
  conference: 'bg-accent-coral text-white',
  other: 'bg-gray-500 text-white',
};

export default function VenueCard({ venue, onViewDetail, className }: VenueCardProps) {
  const coverImage = venue.images[0] || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20event%20venue%20interior%20with%20modern%20design%20warm%20lighting&image_size=landscape_4_3';

  const handleClick = () => {
    if (onViewDetail) {
      onViewDetail(venue);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100',
        'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm',
              VENUE_TYPE_COLORS[venue.type] || VENUE_TYPE_COLORS.other
            )}
          >
            {VENUE_TYPE_LABELS[venue.type]}
          </span>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm">
            <Star className="w-3.5 h-3.5 text-accent-gold fill-accent-gold" />
            <span className="text-sm font-bold text-gray-900">{venue.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({venue.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1">{venue.city} · {venue.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 py-3 border-y border-gray-50">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">{venue.capacity}</span>
            <span className="text-xs text-gray-400">人</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">{venue.area}</span>
            <span className="text-xs text-gray-400">㎡</span>
          </div>
        </div>

        {venue.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {venue.facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-600 border border-gray-100"
              >
                {facility}
              </span>
            ))}
            {venue.facilities.length > 3 && (
              <span className="px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-400 border border-gray-100">
                +{venue.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs text-gray-400">起价</span>
              <span className="text-xl font-bold text-accent-coral">¥{venue.basePrice.toLocaleString()}</span>
            </div>
            <span className="text-xs text-gray-400">/场</span>
          </div>

          <Link
            to={`/venues/${venue.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-600 hover:text-white transition-all duration-200 group/btn"
          >
            查看详情
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
