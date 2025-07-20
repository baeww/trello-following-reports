import React from 'react';
import { ExternalLink, Calendar, List, Activity } from 'lucide-react';
import { TrelloBoard } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface BoardCardProps {
  board: TrelloBoard;
}

export function BoardCard({ board }: BoardCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{board.name}</h3>
          {board.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
          )}
        </div>
        <a
          href={board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-trello-blue hover:text-blue-600 p-1"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <List className="w-4 h-4 text-trello-green mr-1" />
            <span className="text-lg font-semibold text-gray-800">{board.stats.totalCards}</span>
          </div>
          <span className="text-xs text-gray-500">Cards</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="w-4 h-4 text-trello-orange mr-1" />
            <span className="text-lg font-semibold text-gray-800">{board.stats.totalLists}</span>
          </div>
          <span className="text-xs text-gray-500">Lists</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="w-4 h-4 text-trello-purple mr-1" />
            <span className="text-lg font-semibold text-gray-800">{board.stats.recentActions}</span>
          </div>
          <span className="text-xs text-gray-500">Actions</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Last activity: {formatDate(board.lastActivity)}</span>
        </div>
      </div>

      {board.cards.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Cards:</h4>
          <div className="space-y-1">
            {board.cards.slice(0, 3).map((card) => (
              <div key={card.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate flex-1">{card.name}</span>
                <span className="text-xs text-gray-400 ml-2">{card.listName}</span>
              </div>
            ))}
            {board.cards.length > 3 && (
              <div className="text-xs text-gray-400">
                +{board.cards.length - 3} more cards
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 