import React from 'react';
import { Search, X } from 'lucide-react';
import { useTrello } from '../context/TrelloContext';

export function BoardSearch() {
  const { state, dispatch } = useTrello();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_BOARD_SEARCH_TERM', payload: event.target.value });
  };

  const clearSearch = () => {
    dispatch({ type: 'SET_BOARD_SEARCH_TERM', payload: '' });
  };

  if (state.boards.length === 0 || !state.showBoardSummaries) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={state.boardSearchTerm}
          onChange={handleSearchChange}
          placeholder="Search boards by title..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-trello-blue focus:border-transparent"
        />
        {state.boardSearchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {state.boardSearchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          {state.boards.filter(board => 
            board.personalizedName.toLowerCase().includes(state.boardSearchTerm.toLowerCase()) ||
            board.name.toLowerCase().includes(state.boardSearchTerm.toLowerCase())
          ).length} of {state.boards.length} boards match
        </div>
      )}
    </div>
  );
} 