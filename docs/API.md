# Trello Dashboard API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:30:00.000Z"
}
```

### Get Multiple Boards Data
**POST** `/boards`

Fetch data for multiple Trello boards.

**Request Body:**
```json
{
  "board_ids": ["board_id_1", "board_id_2", "board_id_3"]
}
```

**Response:**
```json
{
  "boards": [
    {
      "id": "board_id",
      "name": "Board Name",
      "description": "Board description",
      "url": "https://trello.com/b/board_id/board-name",
      "lastActivity": "2023-12-01T10:30:00.000Z",
      "cards": [...],
      "lists": [...],
      "actions": [...],
      "stats": {
        "totalCards": 25,
        "totalLists": 5,
        "recentActions": 10
      }
    }
  ],
  "timestamp": "2023-12-01T10:30:00.000Z"
}
```

### Get Single Board Data
**GET** `/board/{board_id}`

Fetch data for a single Trello board.

**Response:**
```json
{
  "id": "board_id",
  "name": "Board Name",
  "description": "Board description",
  "url": "https://trello.com/b/board_id/board-name",
  "lastActivity": "2023-12-01T10:30:00.000Z",
  "cards": [...],
  "lists": [...],
  "actions": [...],
  "stats": {
    "totalCards": 25,
    "totalLists": 5,
    "recentActions": 10
  }
}
```

### Get Boards Activity
**POST** `/boards/activity`

Fetch recent activity across multiple boards.

**Request Body:**
```json
{
  "board_ids": ["board_id_1", "board_id_2"],
  "since": "2023-11-01T00:00:00.000Z"  // Optional
}
```

**Response:**
```json
{
  "activities": [
    {
      "id": "action_id",
      "type": "commentCard",
      "date": "2023-12-01T10:30:00.000Z",
      "data": {...},
      "memberCreator": {
        "id": "member_id",
        "username": "username",
        "fullName": "Full Name"
      },
      "boardName": "Board Name",
      "boardId": "board_id"
    }
  ],
  "timestamp": "2023-12-01T10:30:00.000Z"
}
```

## Data Types

### Card
```json
{
  "id": "card_id",
  "name": "Card Name",
  "desc": "Card description",
  "dateLastActivity": "2023-12-01T10:30:00.000Z",
  "due": "2023-12-15T00:00:00.000Z",
  "labels": [...],
  "idList": "list_id",
  "listName": "List Name"
}
```

### List
```json
{
  "id": "list_id",
  "name": "List Name"
}
```

### Action
```json
{
  "id": "action_id",
  "type": "commentCard|updateCard|createCard|moveCardFromList",
  "date": "2023-12-01T10:30:00.000Z",
  "data": {
    "card": {...},
    "listBefore": {...},
    "listAfter": {...}
  },
  "memberCreator": {
    "id": "member_id",
    "username": "username",
    "fullName": "Full Name"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "No board IDs provided"
}
```

### 404 Not Found
```json
{
  "error": "Board not found or not accessible"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message"
}
```

## Authentication

**Public Boards:** No authentication required.

**Private Boards:** The API requires Trello API credentials to be set in environment variables:
- `TRELLO_API_KEY`: Your Trello API key
- `TRELLO_API_TOKEN`: Your Trello API token

You can get these from: https://trello.com/app-key 