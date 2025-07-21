import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TrelloBoard, TrelloAction } from '../types';

interface TrelloState {
  boards: TrelloBoard[];
  activities: TrelloAction[];
  loading: boolean;
  error: string | null;
  selectedBoardIds: string[];
  activityFilter: string; // 'all' or board ID
  activityPage: number;
  activitiesPerPage: number;
  showBoardSummaries: boolean;
  boardSearchTerm: string;
  showActivityTimeline: boolean;
}

type TrelloActionType = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARDS'; payload: TrelloBoard[] }
  | { type: 'SET_ACTIVITIES'; payload: TrelloAction[] }
  | { type: 'SET_SELECTED_BOARDS'; payload: string[] }
  | { type: 'ADD_BOARD'; payload: string }
  | { type: 'REMOVE_BOARD'; payload: string }
  | { type: 'CLEAR_ALL_BOARDS' }
  | { type: 'SET_ACTIVITY_FILTER'; payload: string }
  | { type: 'SET_ACTIVITY_PAGE'; payload: number }
  | { type: 'NEXT_ACTIVITY_PAGE' }
  | { type: 'PREV_ACTIVITY_PAGE' }
  | { type: 'TOGGLE_BOARD_SUMMARIES' }
  | { type: 'SET_BOARD_SEARCH_TERM'; payload: string }
  | { type: 'TOGGLE_ACTIVITY_TIMELINE' };

// Load saved board IDs from localStorage
const loadSavedBoardIds = (): string[] => {
  try {
    const saved = localStorage.getItem('trello-selected-boards');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved board IDs:', error);
    return [];
  }
};

// Load saved activity filter from localStorage
const loadSavedActivityFilter = (): string => {
  try {
    const saved = localStorage.getItem('trello-activity-filter');
    return saved || 'all';
  } catch (error) {
    console.error('Failed to load saved activity filter:', error);
    return 'all';
  }
};

const initialState: TrelloState = {
  boards: [],
  activities: [],
  loading: false,
  error: null,
  selectedBoardIds: loadSavedBoardIds(),
  activityFilter: loadSavedActivityFilter(),
  activityPage: 1,
  activitiesPerPage: 50,
  showBoardSummaries: true, // Default to true
  boardSearchTerm: '',
  showActivityTimeline: true, // Default to true
};

// Save board IDs to localStorage
const saveBoardIds = (boardIds: string[]) => {
  try {
    localStorage.setItem('trello-selected-boards', JSON.stringify(boardIds));
  } catch (error) {
    console.error('Failed to save board IDs:', error);
  }
};

// Save activity filter to localStorage
const saveActivityFilter = (filter: string) => {
  try {
    localStorage.setItem('trello-activity-filter', filter);
  } catch (error) {
    console.error('Failed to save activity filter:', error);
  }
};

function trelloReducer(state: TrelloState, action: TrelloActionType): TrelloState {
  let newState: TrelloState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    case 'SET_ERROR':
      newState = { ...state, error: action.payload };
      break;
    case 'SET_BOARDS':
      newState = { ...state, boards: action.payload };
      break;
    case 'SET_ACTIVITIES':
      newState = { ...state, activities: action.payload };
      break;
    case 'SET_SELECTED_BOARDS':
      newState = { ...state, selectedBoardIds: action.payload };
      saveBoardIds(action.payload);
      break;
    case 'ADD_BOARD':
      newState = { 
        ...state, 
        selectedBoardIds: [...state.selectedBoardIds, action.payload] 
      };
      saveBoardIds(newState.selectedBoardIds);
      break;
    case 'REMOVE_BOARD':
      newState = { 
        ...state, 
        selectedBoardIds: state.selectedBoardIds.filter(id => id !== action.payload) 
      };
      saveBoardIds(newState.selectedBoardIds);
      break;
    case 'CLEAR_ALL_BOARDS':
      newState = { 
        ...state, 
        selectedBoardIds: [] 
      };
      saveBoardIds([]);
      break;
    case 'SET_ACTIVITY_FILTER':
      newState = { 
        ...state, 
        activityFilter: action.payload,
        activityPage: 1 // Reset to first page when filter changes
      };
      saveActivityFilter(action.payload);
      break;
    case 'SET_ACTIVITY_PAGE':
      newState = { 
        ...state, 
        activityPage: action.payload 
      };
      break;
    case 'NEXT_ACTIVITY_PAGE':
      newState = { 
        ...state, 
        activityPage: state.activityPage + 1 
      };
      break;
    case 'PREV_ACTIVITY_PAGE':
      newState = { 
        ...state, 
        activityPage: Math.max(1, state.activityPage - 1) 
      };
      break;
    case 'TOGGLE_BOARD_SUMMARIES':
      newState = { 
        ...state, 
        showBoardSummaries: !state.showBoardSummaries 
      };
      break;
    case 'SET_BOARD_SEARCH_TERM':
      newState = {
        ...state,
        boardSearchTerm: action.payload
      };
      break;
    case 'TOGGLE_ACTIVITY_TIMELINE':
      newState = {
        ...state,
        showActivityTimeline: !state.showActivityTimeline
      };
      break;
    default:
      return state;
  }
  
  return newState;
}

interface TrelloContextType {
  state: TrelloState;
  dispatch: React.Dispatch<TrelloActionType>;
}

const TrelloContext = createContext<TrelloContextType | undefined>(undefined);

export function TrelloProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trelloReducer, initialState);

  return (
    <TrelloContext.Provider value={{ state, dispatch }}>
      {children}
    </TrelloContext.Provider>
  );
}

export function useTrello() {
  const context = useContext(TrelloContext);
  if (context === undefined) {
    throw new Error('useTrello must be used within a TrelloProvider');
  }
  return context;
} 