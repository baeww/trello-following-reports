# Trello Following Reports

A dashboard application that tracks updates across multiple public Trello boards and presents them in a unified interface.

## Features

- Track multiple public Trello boards simultaneously
- Real-time updates and activity monitoring
- Modern, responsive dashboard interface
- Filter and search capabilities
- Activity timeline across all boards

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Flask + Python
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Project Structure

```
trello-following-reports/
├── frontend/          # Vite React application
├── backend/           # Flask API server
├── shared/            # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Trello API access (optional - only needed for private boards)

### Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. Start the Flask backend:
   ```bash
   cd backend
   python app.py
   ```

2. Start the Vite development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Configuration

For public boards, no configuration is needed! The app will work out of the box.

For private boards, create a `.env` file in the backend directory with your Trello API credentials:

```
TRELLO_API_KEY=your_api_key
TRELLO_API_TOKEN=your_api_token
```

## License

MIT License