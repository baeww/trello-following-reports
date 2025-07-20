from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Trello API configuration
TRELLO_API_KEY = os.getenv('TRELLO_API_KEY')
TRELLO_API_TOKEN = os.getenv('TRELLO_API_TOKEN')
TRELLO_BASE_URL = 'https://api.trello.com/1'

class TrelloAPI:
    def __init__(self, api_key=None, api_token=None):
        self.api_key = api_key
        self.api_token = api_token
        self.base_url = TRELLO_BASE_URL
    
    def get_board_info(self, board_id):
        """Get basic board information"""
        url = f"{self.base_url}/boards/{board_id}"
        params = {
            'fields': 'name,desc,url,dateLastActivity'
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else None
    
    def get_board_cards(self, board_id):
        """Get all cards from a board"""
        url = f"{self.base_url}/boards/{board_id}/cards"
        params = {
            'fields': 'name,desc,dateLastActivity,due,labels,idList'
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else []
    
    def get_board_lists(self, board_id):
        """Get all lists from a board"""
        url = f"{self.base_url}/boards/{board_id}/lists"
        params = {
            'fields': 'name,id'
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else []
    
    def get_board_actions(self, board_id, since=None):
        """Get recent actions from a board"""
        url = f"{self.base_url}/boards/{board_id}/actions"
        params = {
            'filter': 'all',
            'limit': 100
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        if since:
            params['since'] = since
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else []

# Initialize Trello API (works with or without credentials)
trello_api = TrelloAPI(TRELLO_API_KEY, TRELLO_API_TOKEN)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/boards', methods=['POST'])
def get_boards_data():
    """Get data for multiple boards"""
    try:
        data = request.get_json()
        board_ids = data.get('board_ids', [])
        
        if not board_ids:
            return jsonify({'error': 'No board IDs provided'}), 400
        
        boards_data = []
        
        for board_id in board_ids:
            board_info = trello_api.get_board_info(board_id)
            if board_info:
                # Get additional data
                cards = trello_api.get_board_cards(board_id)
                lists = trello_api.get_board_lists(board_id)
                actions = trello_api.get_board_actions(board_id)
                
                # Create list name mapping
                list_names = {lst['id']: lst['name'] for lst in lists}
                
                # Add list names to cards
                for card in cards:
                    card['listName'] = list_names.get(card.get('idList'), 'Unknown')
                
                board_data = {
                    'id': board_id,
                    'name': board_info['name'],
                    'description': board_info.get('desc', ''),
                    'url': board_info['url'],
                    'lastActivity': board_info.get('dateLastActivity'),
                    'cards': cards,
                    'lists': lists,
                    'actions': actions,
                    'stats': {
                        'totalCards': len(cards),
                        'totalLists': len(lists),
                        'recentActions': len(actions)
                    }
                }
                boards_data.append(board_data)
        
        return jsonify({
            'boards': boards_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/board/<board_id>', methods=['GET'])
def get_single_board(board_id):
    """Get data for a single board"""
    try:
        board_info = trello_api.get_board_info(board_id)
        if not board_info:
            return jsonify({'error': 'Board not found or not accessible'}), 404
        
        cards = trello_api.get_board_cards(board_id)
        lists = trello_api.get_board_lists(board_id)
        actions = trello_api.get_board_actions(board_id)
        
        # Create list name mapping
        list_names = {lst['id']: lst['name'] for lst in lists}
        
        # Add list names to cards
        for card in cards:
            card['listName'] = list_names.get(card.get('idList'), 'Unknown')
        
        board_data = {
            'id': board_id,
            'name': board_info['name'],
            'description': board_info.get('desc', ''),
            'url': board_info['url'],
            'lastActivity': board_info.get('dateLastActivity'),
            'cards': cards,
            'lists': lists,
            'actions': actions,
            'stats': {
                'totalCards': len(cards),
                'totalLists': len(lists),
                'recentActions': len(actions)
            }
        }
        
        return jsonify(board_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/boards/activity', methods=['POST'])
def get_boards_activity():
    """Get recent activity across multiple boards"""
    try:
        data = request.get_json()
        board_ids = data.get('board_ids', [])
        since = data.get('since')  # ISO format date string
        
        if not board_ids:
            return jsonify({'error': 'No board IDs provided'}), 400
        
        all_activities = []
        
        for board_id in board_ids:
            board_info = trello_api.get_board_info(board_id)
            if board_info:
                actions = trello_api.get_board_actions(board_id, since)
                
                for action in actions:
                    action['boardName'] = board_info['name']
                    action['boardId'] = board_id
                    all_activities.append(action)
        
        # Sort activities by date (most recent first)
        all_activities.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({
            'activities': all_activities,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not TRELLO_API_KEY or not TRELLO_API_TOKEN:
        print("Note: No Trello API credentials provided. The app will work with public boards only.")
        print("For private boards, create a .env file with TRELLO_API_KEY and TRELLO_API_TOKEN")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 