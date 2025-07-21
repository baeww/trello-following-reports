from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
import threading
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Trello API configuration
TRELLO_API_KEY = os.getenv('TRELLO_API_KEY')
TRELLO_API_TOKEN = os.getenv('TRELLO_API_TOKEN')
TRELLO_BASE_URL = 'https://api.trello.com/1'

class CacheManager:
    def __init__(self):
        self.cache = {}
        self.cache_timestamps = {}
        self.cache_lock = threading.Lock()
        self.cache_duration = timedelta(minutes=30)  # Cache for 30 minutes
    
    def get_cached_data(self, key):
        """Get data from cache if it exists and is not expired"""
        with self.cache_lock:
            if key in self.cache:
                timestamp = self.cache_timestamps.get(key)
                if timestamp and datetime.now() - timestamp < self.cache_duration:
                    return self.cache[key]
                else:
                    # Remove expired data
                    del self.cache[key]
                    if key in self.cache_timestamps:
                        del self.cache_timestamps[key]
            return None
    
    def set_cached_data(self, key, data):
        """Store data in cache with current timestamp"""
        with self.cache_lock:
            self.cache[key] = data
            self.cache_timestamps[key] = datetime.now()
    
    def clear_cache(self, key=None):
        """Clear specific cache entry or all cache"""
        with self.cache_lock:
            if key:
                if key in self.cache:
                    del self.cache[key]
                if key in self.cache_timestamps:
                    del self.cache_timestamps[key]
            else:
                self.cache.clear()
                self.cache_timestamps.clear()
    
    def get_cache_info(self):
        """Get information about cached data"""
        with self.cache_lock:
            cache_info = {}
            for key, timestamp in self.cache_timestamps.items():
                age = datetime.now() - timestamp
                cache_info[key] = {
                    'age_seconds': age.total_seconds(),
                    'expires_in_seconds': (self.cache_duration - age).total_seconds(),
                    'is_expired': age >= self.cache_duration
                }
            return cache_info

# Initialize cache manager
cache_manager = CacheManager()

class TrelloAPI:
    def __init__(self, api_key=None, api_token=None):
        self.api_key = api_key
        self.api_token = api_token
        self.base_url = TRELLO_BASE_URL
    
    def get_board_info(self, board_id):
        """Get basic board information"""
        url = f"{self.base_url}/boards/{board_id}"
        params = {
            'fields': 'name,desc,url,dateLastActivity,idMembers'
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else None

    def get_board_members(self, board_id):
        """Get board members information"""
        url = f"{self.base_url}/boards/{board_id}/members"
        params = {
            'fields': 'fullName,username'
        }
        # Add auth params only if credentials are provided
        if self.api_key and self.api_token:
            params['key'] = self.api_key
            params['token'] = self.api_token
        
        response = requests.get(url, params=params)
        return response.json() if response.status_code == 200 else []
    
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
        force_refresh = data.get('force_refresh', False)
        
        if not board_ids:
            return jsonify({'error': 'No board IDs provided'}), 400
        
        boards_data = []
        cache_keys = []
        
        for board_id in board_ids:
            cache_key = f"board_data_{board_id}"
            cache_keys.append(cache_key)
            
            # Try to get from cache first (unless force refresh is requested)
            cached_data = None
            if not force_refresh:
                cached_data = cache_manager.get_cached_data(cache_key)
            
            if cached_data:
                boards_data.append(cached_data)
            else:
                # Fetch fresh data from Trello API
                board_info = trello_api.get_board_info(board_id)
                if board_info:
                    # Get additional data
                    cards = trello_api.get_board_cards(board_id)
                    lists = trello_api.get_board_lists(board_id)
                    actions = trello_api.get_board_actions(board_id)
                    members = trello_api.get_board_members(board_id)
                    
                    # Create list name mapping
                    list_names = {lst['id']: lst['name'] for lst in lists}
                    
                    # Add list names to cards
                    for card in cards:
                        card['listName'] = list_names.get(card.get('idList'), 'Unknown')
                    
                    # Create personalized board name
                    original_name = board_info['name']
                    personalized_name = original_name
                    
                    if members:
                        # Get the first member (usually the owner)
                        owner = members[0]
                        owner_name = owner.get('fullName') or owner.get('username', 'Unknown')
                        
                        # Create personalized name: "Board Name (Owner's Name)"
                        personalized_name = f"{original_name} ({owner_name})"
                    
                    board_data = {
                        'id': board_id,
                        'name': original_name,
                        'personalizedName': personalized_name,
                        'owner': members[0] if members else None,
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
                    
                    # Cache the board data
                    cache_manager.set_cached_data(cache_key, board_data)
                    boards_data.append(board_data)
        
        # Get cache info for response
        cache_info = cache_manager.get_cache_info()
        response_cache_info = {key: cache_info[key] for key in cache_keys if key in cache_info}
        
        return jsonify({
            'boards': boards_data,
            'timestamp': datetime.now().isoformat(),
            'cache_info': response_cache_info,
            'from_cache': not force_refresh and any(cache_manager.get_cached_data(key) for key in cache_keys)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all cache or specific board cache"""
    try:
        data = request.get_json() or {}
        board_id = data.get('board_id')
        
        if board_id:
            cache_key = f"board_data_{board_id}"
            cache_manager.clear_cache(cache_key)
            return jsonify({
                'message': f'Cache cleared for board {board_id}',
                'timestamp': datetime.now().isoformat()
            })
        else:
            cache_manager.clear_cache()
            return jsonify({
                'message': 'All cache cleared',
                'timestamp': datetime.now().isoformat()
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cache/info', methods=['GET'])
def get_cache_info():
    """Get information about cached data"""
    try:
        cache_info = cache_manager.get_cache_info()
        return jsonify({
            'cache_info': cache_info,
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
        members = trello_api.get_board_members(board_id)
        
        # Create list name mapping
        list_names = {lst['id']: lst['name'] for lst in lists}
        
        # Add list names to cards
        for card in cards:
            card['listName'] = list_names.get(card.get('idList'), 'Unknown')
        
        # Create personalized board name
        original_name = board_info['name']
        personalized_name = original_name
        
        if members:
            # Get the first member (usually the owner)
            owner = members[0]
            owner_name = owner.get('fullName') or owner.get('username', 'Unknown')
            
            # Create personalized name: "Board Name (Owner's Name)"
            personalized_name = f"{original_name} ({owner_name})"
        
        board_data = {
            'id': board_id,
            'name': original_name,
            'personalizedName': personalized_name,
            'owner': members[0] if members else None,
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