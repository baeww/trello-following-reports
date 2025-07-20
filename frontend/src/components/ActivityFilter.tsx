import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { useTrello } from '../context/TrelloContext';

export function ActivityFilter() {
  const { state, dispatch } = useTrello();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_ACTIVITY_FILTER', payload: event.target.value });
  };

  if (state.boards.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="w-4 h-4 text-gray-500 mr-2" />
          <label htmlFor="activity-filter" className="text-sm font-medium text-gray-700">
            Filter Activities:
          </label>
        </div>
        <div className="relative">
          <select
            id="activity-filter"
            value={state.activityFilter}
            onChange={handleFilterChange}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-trello-blue focus:border-transparent"
          >
            <option value="all">All Boards ({state.activities.length})</option>
            {state.boards.map((board) => {
              const boardActivities = state.activities.filter(
                activity => activity.boardId === board.id
              );
              return (
                <option key={board.id} value={board.id}>
                  {board.personalizedName} ({boardActivities.length})
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
} 