import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Trash2 } from 'lucide-react';
import { trelloApi } from '../services/api';

interface CacheInfo {
  [key: string]: {
    age_seconds: number;
    expires_in_seconds: number;
    is_expired: boolean;
  };
}

interface CacheStatusProps {
  cacheInfo?: CacheInfo;
  fromCache?: boolean;
  onCacheCleared?: () => void;
}

export function CacheStatus({ cacheInfo, fromCache, onCacheCleared }: CacheStatusProps) {
  const [isClearing, setIsClearing] = useState(false);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await trelloApi.clearCache();
      onCacheCleared?.();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (!cacheInfo || Object.keys(cacheInfo).length === 0) {
    return null;
  }

  const totalBoards = Object.keys(cacheInfo).length;
  const expiredBoards = Object.values(cacheInfo).filter(info => info.is_expired).length;
  const freshBoards = totalBoards - expiredBoards;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <div className="text-sm text-blue-800">
            <span className="font-medium">Cache Status:</span>
            {fromCache ? (
              <span className="ml-1 text-green-600">Using cached data</span>
            ) : (
              <span className="ml-1 text-orange-600">Fresh data loaded</span>
            )}
            <span className="ml-2">
              ({freshBoards} fresh, {expiredBoards} expired)
            </span>
          </div>
        </div>
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="flex items-center px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors disabled:opacity-50"
          title="Clear all cached data"
        >
          {isClearing ? (
            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Trash2 className="w-3 h-3 mr-1" />
          )}
          Clear Cache
        </button>
      </div>
      
      {totalBoards > 0 && (
        <div className="mt-2 text-xs text-blue-600">
          {Object.entries(cacheInfo).map(([key, info]) => {
            const boardId = key.replace('board_data_', '');
            return (
              <div key={key} className="flex justify-between items-center">
                <span>Board {boardId}:</span>
                <span className={info.is_expired ? 'text-orange-600' : 'text-green-600'}>
                  {info.is_expired ? 'Expired' : `Expires in ${formatTime(info.expires_in_seconds)}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 