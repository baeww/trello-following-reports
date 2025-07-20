@echo off
echo 🚀 Setting up Trello Dashboard...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy env.example .env
    echo ℹ️  API credentials are optional - only needed for private boards
    echo    Edit backend\.env if you want to track private boards
)

cd ..

REM Setup frontend
echo 📦 Setting up frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. For private boards: Edit backend\.env with your Trello API credentials
echo 2. Start the backend: cd backend ^&^& venv\Scripts\activate.bat ^&^& python app.py
echo 3. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo The dashboard will be available at http://localhost:3000
echo Public boards work without any configuration!
pause 