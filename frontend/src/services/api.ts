import axios from 'axios';
import { BoardsResponse, ActivityResponse, TrelloBoard } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trelloApi = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get data for multiple boards
  getBoardsData: async (boardIds: string[]): Promise<BoardsResponse> => {
    const response = await api.post('/boards', { board_ids: boardIds });
    return response.data;
  },

  // Get data for a single board
  getBoardData: async (boardId: string): Promise<TrelloBoard> => {
    const response = await api.get(`/board/${boardId}`);
    return response.data;
  },

  // Get recent activity across multiple boards
  getBoardsActivity: async (boardIds: string[], since?: string): Promise<ActivityResponse> => {
    const payload: any = { board_ids: boardIds };
    if (since) {
      payload.since = since;
    }
    const response = await api.post('/boards/activity', payload);
    return response.data;
  },
}; 