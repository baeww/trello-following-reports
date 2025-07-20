export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  dateLastActivity: string;
  due?: string;
  labels: TrelloLabel[];
  idList: string;
  listName: string;
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface TrelloAction {
  id: string;
  type: string;
  date: string;
  data: any;
  memberCreator?: {
    id: string;
    username: string;
    fullName: string;
  };
  boardName?: string;
  boardId?: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
  personalizedName: string;
  owner?: {
    id: string;
    fullName?: string;
    username: string;
  };
  description: string;
  url: string;
  lastActivity: string;
  cards: TrelloCard[];
  lists: TrelloList[];
  actions: TrelloAction[];
  stats: {
    totalCards: number;
    totalLists: number;
    recentActions: number;
  };
}

export interface BoardsResponse {
  boards: TrelloBoard[];
  timestamp: string;
}

export interface ActivityResponse {
  activities: TrelloAction[];
  timestamp: string;
} 