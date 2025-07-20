import React, { useState } from 'react';
import { Plus, X, Trello, Trash2 } from 'lucide-react';
import { useTrello } from '../context/TrelloContext';

export function BoardSelector() {
  const { state, dispatch } = useTrello();
  const [newBoardId, setNewBoardId] = useState('');

  const extractBoardId = (input: string): string | null => {
    const trimmed = input.trim();
    
    // If it's already just an ID (alphanumeric, no slashes), return as is
    if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
      return trimmed;
    }
    
    // Try to extract from Trello URL
    const urlMatch = trimmed.match(/trello\.com\/b\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Try to extract from any URL with board ID pattern
    const generalMatch = trimmed.match(/\/([a-zA-Z0-9]{8,})\//);
    if (generalMatch) {
      return generalMatch[1];
    }
    
    return null;
  };

  const handleAddBoard = () => {
    const boardId = extractBoardId(newBoardId);
    if (boardId && !state.selectedBoardIds.includes(boardId)) {
      dispatch({ type: 'ADD_BOARD', payload: boardId });
      setNewBoardId('');
    }
  };

  const handleRemoveBoard = (boardId: string) => {
    dispatch({ type: 'REMOVE_BOARD', payload: boardId });
  };

  const handleClearAllBoards = () => {
    dispatch({ type: 'CLEAR_ALL_BOARDS' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddBoard();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Trello className="w-5 h-5 mr-2 text-trello-blue" />
        Board Selection
      </h2>
      
      <div className="mb-4">
        <label htmlFor="boardId" className="block text-sm font-medium text-gray-700 mb-2">
          Add Board ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="boardId"
            value={newBoardId}
            onChange={(e) => setNewBoardId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste Trello URL or board ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trello-blue focus:border-transparent"
          />
          <button
            onClick={handleAddBoard}
            disabled={!newBoardId.trim()}
            className="px-4 py-2 bg-trello-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          You can paste the full Trello URL or just the board ID: trello.com/b/[BOARD_ID]/[BOARD_NAME]
        </p>
      </div>

      {state.selectedBoardIds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Selected Boards:</h3>
            <button
              onClick={handleClearAllBoards}
              className="text-red-500 hover:text-red-700 text-sm flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {state.selectedBoardIds.map((boardId) => (
              <div
                key={boardId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="font-mono text-sm text-gray-600">{boardId}</span>
                <button
                  onClick={() => handleRemoveBoard(boardId)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.selectedBoardIds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trello className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No boards selected</p>
          <p className="text-sm">Add a board ID above to start tracking</p>
        </div>
      )}
    </div>
  );
} 