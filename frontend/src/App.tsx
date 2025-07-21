import React, { useEffect } from 'react';
import { TrelloProvider, useTrello } from './context/TrelloContext';
import { BoardSelector } from './components/BoardSelector';
import { BoardSearch } from './components/BoardSearch';
import { BoardCard } from './components/BoardCard';
import { ActivityFilter } from './components/ActivityFilter';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CacheStatus } from './components/CacheStatus';
import { trelloApi } from './services/api';
import { RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';

function Dashboard() {
  const { state, dispatch } = useTrello();
  const [cacheInfo, setCacheInfo] = React.useState<any>(null);
  const [fromCache, setFromCache] = React.useState<boolean>(false);

  const fetchBoardsData = async (forceRefresh: boolean = false) => {
    if (state.selectedBoardIds.length === 0) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await trelloApi.getBoardsData(state.selectedBoardIds, forceRefresh);
      dispatch({ type: 'SET_BOARDS', payload: response.boards });
      
      // Update cache information
      if (response.cache_info) {
        setCacheInfo(response.cache_info);
        setFromCache(response.from_cache || false);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch boards data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchActivities = async () => {
    if (state.selectedBoardIds.length === 0) return;
    
    try {
      const response = await trelloApi.getBoardsActivity(state.selectedBoardIds);
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  useEffect(() => {
    fetchBoardsData(false); // Don't force refresh on initial load
    fetchActivities();
  }, [state.selectedBoardIds]);

  const handleRefresh = () => {
    fetchBoardsData(true); // Force refresh when refresh button is clicked
    fetchActivities();
  };

  const toggleBoardSummaries = () => {
    dispatch({ type: 'TOGGLE_BOARD_SUMMARIES' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Trello Dashboard</h1>
            <div className="flex items-center space-x-2">
              {state.boards.length > 0 && (
                <button
                  onClick={toggleBoardSummaries}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  title={state.showBoardSummaries ? "Hide Board Summaries" : "Show Board Summaries"}
                >
                  {state.showBoardSummaries ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {state.showBoardSummaries ? "Hide Boards" : "Show Boards"}
                </button>
              )}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_ACTIVITY_TIMELINE' })}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                title={state.showActivityTimeline ? "Hide Activity Timeline" : "Show Activity Timeline"}
              >
                {state.showActivityTimeline ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {state.showActivityTimeline ? "Hide Timeline" : "Show Timeline"}
              </button>
              <button
                onClick={handleRefresh}
                disabled={state.loading}
                className="flex items-center px-4 py-2 bg-trello-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <BoardSelector />

        <BoardSearch />

        <CacheStatus 
          cacheInfo={cacheInfo} 
          fromCache={fromCache}
          onCacheCleared={() => {
            setCacheInfo(null);
            setFromCache(false);
          }}
        />

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{state.error}</span>
            </div>
          </div>
        )}

        {state.loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-trello-blue mb-2" />
            <p className="text-gray-600">Loading boards data...</p>
          </div>
        )}

        {!state.loading && state.boards.length > 0 && state.showBoardSummaries && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {state.boards
              .filter(board => 
                !state.boardSearchTerm || 
                board.personalizedName.toLowerCase().includes(state.boardSearchTerm.toLowerCase()) ||
                board.name.toLowerCase().includes(state.boardSearchTerm.toLowerCase())
              )
              .map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
          </div>
        )}

        {!state.loading && state.boards.length > 0 && state.showActivityTimeline && (
          <>
            <ActivityFilter />
            <ActivityTimeline activities={state.activities} />
          </>
        )}

        {!state.loading && state.selectedBoardIds.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Welcome to Trello Dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                  Add Trello board IDs above to start tracking their activity and get insights across all your boards.
                </p>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">To find a board ID:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open your Trello board</li>
                    <li>Look at the URL: trello.com/b/[BOARD_ID]/[BOARD_NAME]</li>
                    <li>Copy the BOARD_ID part</li>
                  </ol>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-600">
                    💾 Your board selections will be saved automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <TrelloProvider>
      <Dashboard />
    </TrelloProvider>
  );
}

export default App; 