import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTrello } from '../context/TrelloContext';

interface ActivityPaginationProps {
  totalActivities: number;
  currentPage: number;
  activitiesPerPage: number;
}

export function ActivityPagination({ totalActivities, currentPage, activitiesPerPage }: ActivityPaginationProps) {
  const { dispatch } = useTrello();
  
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage + 1;
  const endIndex = Math.min(currentPage * activitiesPerPage, totalActivities);
  
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_ACTIVITY_PAGE', payload: page });
  };

  const handleNextPage = () => {
    dispatch({ type: 'NEXT_ACTIVITY_PAGE' });
  };

  const handlePrevPage = () => {
    dispatch({ type: 'PREV_ACTIVITY_PAGE' });
  };

  const handleFirstPage = () => {
    dispatch({ type: 'SET_ACTIVITY_PAGE', payload: 1 });
  };

  const handleLastPage = () => {
    dispatch({ type: 'SET_ACTIVITY_PAGE', payload: totalPages });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Near start: show 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 mt-4">
      <div className="text-sm text-gray-600">
        Showing {startIndex} to {endIndex} of {totalActivities} activities
      </div>
      
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        {/* Previous page button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? 'bg-trello-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next page button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* Last page button */}
        <button
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 