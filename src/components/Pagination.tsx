import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showTotal?: boolean;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showTotal = false,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {showTotal && totalItems !== undefined && (
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          共 <span className="font-medium text-gray-700">{totalItems}</span> 条数据，
          第 <span className="font-medium text-gray-700">{currentPage}</span> / {totalPages} 页
        </p>
      )}

      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="分页导航"
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all',
            currentPage === 1
              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
          aria-label="上一页"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-9 h-9 text-gray-400"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all',
                currentPage === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all',
            currentPage === totalPages
              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
          aria-label="下一页"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
