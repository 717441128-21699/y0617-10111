import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showValue?: boolean;
  allowHalf?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: 'w-3.5 h-3.5 gap-0.5',
  md: 'w-5 h-5 gap-1',
  lg: 'w-7 h-7 gap-1.5',
};

const textSizeConfig = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export default function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  showValue = false,
  allowHalf = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (index: number, isHalf: boolean) => {
    if (readOnly || !onChange) return;
    const newValue = isHalf ? index + 0.5 : index + 1;
    onChange(newValue);
  };

  const handleMouseMove = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = allowHalf && x < rect.width / 2;
    setHoverValue(isHalf ? index + 0.5 : index + 1);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const filled = displayValue >= starValue;
    const halfFilled = allowHalf && displayValue >= index + 0.5 && displayValue < starValue;

    return (
      <div
        key={index}
        className={cn(
          'relative cursor-default select-none',
          !readOnly && onChange && 'cursor-pointer'
        )}
        onClick={(e) => {
          if (readOnly || !onChange) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const isHalf = allowHalf && x < rect.width / 2;
          handleClick(index, isHalf);
        }}
        onMouseMove={(e) => handleMouseMove(index, e)}
        onMouseLeave={handleMouseLeave}
      >
        <Star
          className={cn(
            sizeConfig[size].split(' ')[0],
            sizeConfig[size].split(' ')[1] ? '' : '',
            'transition-colors',
            filled
              ? 'text-accent-gold fill-accent-gold'
              : halfFilled
              ? 'text-accent-gold'
              : 'text-gray-200 fill-gray-100'
          )}
        />
        {halfFilled && (
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-full h-full text-accent-gold fill-accent-gold" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className={cn('flex items-center', sizeConfig[size].split(' ').slice(1).join(' '))}
        style={{ gap: size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px' }}
      >
        {Array.from({ length: max }, (_, i) => renderStar(i))}
      </div>
      {showValue && (
        <span className={cn('ml-2 font-medium text-gray-700', textSizeConfig[size])}>
          {value.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}
    </div>
  );
}

