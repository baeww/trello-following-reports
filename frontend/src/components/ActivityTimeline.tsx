import React from 'react';
import { Clock, User, MessageSquare, CheckSquare, Plus } from 'lucide-react';
import { TrelloAction } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useTrello } from '../context/TrelloContext';
import { ActivityPagination } from './ActivityPagination';

interface ActivityTimelineProps {
  activities: TrelloAction[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const { state } = useTrello();

  // Filter activities based on the current filter
  const filteredActivities = state.activityFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.boardId === state.activityFilter);

  // Apply pagination
  const startIndex = (state.activityPage - 1) * state.activitiesPerPage;
  const endIndex = startIndex + state.activitiesPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'commentCard':
        return <MessageSquare className="w-4 h-4 text-trello-blue" />;
      case 'updateCard':
        return <CheckSquare className="w-4 h-4 text-trello-green" />;
      case 'createCard':
        return <Plus className="w-4 h-4 text-trello-orange" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionDescription = (action: TrelloAction) => {
    const member = action.memberCreator?.fullName || action.memberCreator?.username || 'Unknown user';
    
    switch (action.type) {
      case 'commentCard':
        return `${member} commented on "${action.data.card?.name || 'a card'}"`;
      case 'updateCard':
        return `${member} updated "${action.data.card?.name || 'a card'}"`;
      case 'createCard':
        return `${member} created "${action.data.card?.name || 'a card'}"`;
      case 'moveCardFromList':
        return `${member} moved "${action.data.card?.name || 'a card'}" from "${action.data.listBefore?.name || 'unknown'}" to "${action.data.listAfter?.name || 'unknown'}"`;
      default:
        return `${member} performed ${action.type}`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (filteredActivities.length === 0) {
    const selectedBoard = state.boards.find(board => board.id === state.activityFilter);
    const boardName = selectedBoard ? selectedBoard.name : 'selected board';
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No recent activity</p>
          {state.activityFilter !== 'all' && (
            <p className="text-sm mt-2">No activities found for {boardName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
      <div className="space-y-4">
        {paginatedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getActionIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-800">
                  {getActionDescription(activity)}
                </p>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(activity.date)}
                </span>
              </div>
              {activity.boardName && (
                <p className="text-xs text-gray-500 mt-1">
                  in <span className="font-medium">{activity.boardName}</span>
                </p>
              )}
              {activity.memberCreator && (
                <div className="flex items-center mt-1">
                  <User className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {activity.memberCreator.fullName || activity.memberCreator.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        <ActivityPagination 
          totalActivities={filteredActivities.length}
          currentPage={state.activityPage}
          activitiesPerPage={state.activitiesPerPage}
        />
      </div>
    </div>
  );
} 