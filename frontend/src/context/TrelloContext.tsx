import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TrelloBoard, TrelloAction } from '../types';

interface TrelloState {
  boards: TrelloBoard[];
  activities: TrelloAction[];
  loading: boolean;
  error: string | null;
  selectedBoardIds: string[];
  activityFilter: string; // 'all' or board ID
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
  | { type: 'SET_ACTIVITY_FILTER'; payload: string };

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
        activityFilter: action.payload 
      };
      saveActivityFilter(action.payload);
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