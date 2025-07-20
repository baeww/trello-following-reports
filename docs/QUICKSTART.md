# Quick Start Guide

## Prerequisites

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Trello API credentials** - Only needed for private boards (get from [Trello App Key](https://trello.com/app-key))

## Getting Your Trello API Credentials (Optional)

**Note:** You only need API credentials for private boards. Public boards work without any setup!

1. Go to [https://trello.com/app-key](https://trello.com/app-key)
2. Copy your **API Key**
3. Click "Token" to generate your **API Token**
4. Save both values for the next step

## Installation

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
./setup.sh
```

### Option 2: Manual Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd trello-following-reports
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   cp env.example .env
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

**For Public Boards:** No configuration needed! Skip this step.

**For Private Boards:**
1. **Edit the environment file:**
   ```bash
   # Edit backend/.env
   TRELLO_API_KEY=your_api_key_here
   TRELLO_API_TOKEN=your_api_token_here
   ```

## Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and go to `http://localhost:3000`

## Using the Dashboard

1. **Add Board IDs:**
   - Open any Trello board
   - Look at the URL: `trello.com/b/[BOARD_ID]/[BOARD_NAME]`
   - Copy the `[BOARD_ID]` part
   - Paste it into the dashboard and click "Add"

2. **View Dashboard:**
   - Board cards show statistics and recent activity
   - Activity timeline shows recent actions across all boards
   - Click "Refresh" to update data

## Finding Board IDs

- **Public Boards:** The board ID is in the URL (no authentication needed)
- **Private Boards:** You need to be a member and provide API credentials
- **Example:** For `https://trello.com/b/abc123/my-board`, the board ID is `abc123`

## Troubleshooting

### Common Issues

1. **"Failed to fetch boards data"**
   - Check your Trello API credentials in `backend/.env`
   - Ensure the board IDs are correct
   - Verify the boards are public or you have access

2. **"Module not found" errors**
   - Run `npm install` in the frontend directory
   - Run `pip install -r requirements.txt` in the backend directory

3. **Port already in use**
   - Backend: Change port in `backend/app.py`
   - Frontend: Change port in `frontend/vite.config.ts`

### Getting Help

- Check the [API Documentation](API.md)
- Review the [README](../README.md)
- Check browser console for frontend errors
- Check terminal for backend errors

## Next Steps

- Customize the dashboard styling
- Add more board tracking features
- Set up automatic refresh intervals
- Deploy to production 