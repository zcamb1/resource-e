"""
Resource Fetcher for ElevenLabs Tool
Auto-fetch API keys and proxies from Resource Management Server
"""

import requests
import json
import os
from typing import Dict, List, Optional, Tuple

class ResourceFetcher:
    def __init__(self, server_url: str = "https://your-server.vercel.app"):
        """
        Initialize Resource Fetcher
        
        Args:
            server_url: URL của Resource Management Server
        """
        self.server_url = server_url.rstrip('/')
        self.config_file = "resource_config.json"
        self.user_id = None
        self.token = None
        
        # Load saved config nếu có
        self.load_config()
    
    def load_config(self):
        """Load user_id và token từ file config"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.user_id = config.get('user_id')
                    self.token = config.get('token')
                    print(f"✅ Loaded config: user_id={self.user_id[:10]}..." if self.user_id else "⚠️ No user_id in config")
        except Exception as e:
            print(f"⚠️ Could not load config: {e}")
    
    def save_config(self, user_id: str, token: str):
        """Save user_id và token vào file config"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump({
                    'user_id': user_id,
                    'token': token,
                }, f, indent=2)
            self.user_id = user_id
            self.token = token
            print(f"✅ Saved config: user_id={user_id[:10]}...")
        except Exception as e:
            print(f"❌ Could not save config: {e}")
    
    def login(self, username: str, password: str) -> bool:
        """
        Login to Resource Management Server
        
        Returns:
            True nếu login thành công, False nếu thất bại
        """
        try:
            url = f"{self.server_url}/api/auth/login"
            response = requests.post(url, json={
                'username': username,
                'password': password,
            }, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                user_id = data.get('userId')
                username = data.get('username', 'user')
                
                if token and user_id:
                    self.save_config(user_id, token)
                    print(f"✅ Login successful: {username}")
                    return True
            
            error = response.json().get('error', 'Unknown error')
            print(f"❌ Login failed: {error}")
            return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def fetch_resources(self) -> Optional[Dict]:
        """
        Fetch resources (API keys & proxies) from server
        
        Returns:
            Dict với api_keys, proxies, rotating_proxy_keys
            None nếu fetch thất bại
        """
        if not self.user_id or not self.token:
            print("⚠️ No user_id or token. Please login first.")
            return None
        
        try:
            url = f"{self.server_url}/api/resources/{self.user_id}"
            headers = {'Authorization': f'Bearer {self.token}'}
            
            print(f"🌐 Fetching resources from {url}...")
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                resources = response.json()
                api_keys = resources.get('api_keys', [])
                proxies = resources.get('proxies', [])
                rotating_keys = resources.get('rotating_proxy_keys', [])
                
                print(f"✅ Fetched resources:")
                print(f"   - API Keys: {len(api_keys)}")
                print(f"   - Proxies: {len(proxies)}")
                print(f"   - Rotating Proxy Keys: {len(rotating_keys)}")
                
                return resources
            
            error = response.json().get('error', 'Unknown error')
            print(f"❌ Fetch failed: {error} (status: {response.status_code})")
            return None
        except Exception as e:
            print(f"❌ Fetch error: {e}")
            return None
    
    def apply_api_keys_to_database(self, db_manager, api_keys: List[Dict]) -> int:
        """
        Apply fetched API keys to local database
        
        Args:
            db_manager: DatabaseManager instance
            api_keys: List of API key dicts from server
            
        Returns:
            Number of keys added
        """
        added_count = 0
        try:
            for key_data in api_keys:
                api_key = key_data.get('api_key')  # Server returns 'api_key', not 'key'
                provider = key_data.get('provider', 'elevenlabs')
                credits = key_data.get('credits', 0)
                
                if not api_key:
                    continue
                
                # Check if key already exists
                existing = db_manager.get_api_keys()
                if any(k['api_key'] == api_key for k in existing):
                    print(f"   ⚠️ Key {api_key[:10]}... already exists, skip")
                    continue
                
                # Add to database
                db_manager.add_api_key(
                    api_key=api_key,
                    credits=credits,
                    is_active=True
                )
                added_count += 1
                print(f"   ✅ Added API key: {api_key[:10]}... (credits: {credits})")
            
            print(f"✅ Applied {added_count}/{len(api_keys)} API keys to database")
            return added_count
        except Exception as e:
            print(f"❌ Error applying API keys: {e}")
            return added_count
    
    def apply_proxies_to_manager(self, proxy_manager, proxies: List[Dict]) -> int:
        """
        Apply fetched proxies to ProxyManager
        
        Args:
            proxy_manager: ProxyManager instance
            proxies: List of proxy dicts from server
            
        Returns:
            Number of proxies added
        """
        added_count = 0
        try:
            for proxy_data in proxies:
                proxy_url = proxy_data.get('proxy_url', '')
                
                if not proxy_url:
                    continue
                
                # Parse proxy URL (e.g., "http://user:pass@host:port" or "host:port")
                try:
                    from urllib.parse import urlparse
                    if '://' not in proxy_url:
                        proxy_url = 'http://' + proxy_url
                    
                    parsed = urlparse(proxy_url)
                    proxy_config = {
                        'enabled': True,
                        'type': parsed.scheme or 'http',
                        'host': parsed.hostname,
                        'port': parsed.port or 8080,
                        'requires_auth': bool(parsed.username),
                        'username': parsed.username or '',
                        'password': parsed.password or '',
                        'source': 'server',
                        'status': '🌐 From Server'
                    }
                except Exception as parse_err:
                    print(f"   ⚠️ Could not parse proxy: {proxy_url} ({parse_err})")
                    continue
                
                # Check if proxy already exists
                proxy_exists = any(
                    p.get('host') == proxy_config['host'] and p.get('port') == proxy_config['port']
                    for p in proxy_manager.proxies
                )
                
                if proxy_exists:
                    print(f"   ⚠️ Proxy {proxy_config['host']}:{proxy_config['port']} already exists, skip")
                    continue
                
                # Add proxy
                with proxy_manager.proxy_lock:
                    proxy_manager.proxies.append(proxy_config)
                    proxy_manager.proxy_score[(proxy_config['type'], proxy_config['host'], proxy_config['port'])] = 10
                
                added_count += 1
                print(f"   ✅ Added proxy: {proxy_config['type']}://{proxy_config['host']}:{proxy_config['port']}")
            
            print(f"✅ Applied {added_count}/{len(proxies)} proxies to manager")
            return added_count
        except Exception as e:
            print(f"❌ Error applying proxies: {e}")
            return added_count
    
    def apply_rotating_keys_to_manager(self, proxy_manager, rotating_keys: List[Dict]) -> int:
        """
        Apply fetched rotating proxy keys to ProxyManager
        
        Args:
            proxy_manager: ProxyManager instance
            rotating_keys: List of rotating key dicts from server
            
        Returns:
            Number of rotating keys ready to use
        """
        added_count = 0
        try:
            keys_to_start = []
            
            for key_data in rotating_keys:
                api_key = key_data.get('api_key')  # Server returns 'api_key', not 'key'
                key_name = key_data.get('key_name', 'Server Key')  # Server returns 'key_name', not 'name'
                
                if not api_key:
                    continue
                
                # Check if key already active
                if api_key in proxy_manager.rotating_keys:
                    print(f"   ⚠️ Rotating key {api_key[:10]}... already active, skip")
                    continue
                
                keys_to_start.append(api_key)
                print(f"   ✅ Prepared rotating key: {key_name} ({api_key[:10]}...)")
                added_count += 1
            
            # Start rotating proxy với tất cả keys
            if keys_to_start:
                proxy_manager.start_rotating_proxy(keys_to_start)
                print(f"✅ Started {len(keys_to_start)} rotating proxy key(s)")
            
            return added_count
        except Exception as e:
            print(f"❌ Error applying rotating keys: {e}")
            return added_count


# === USAGE EXAMPLE ===
if __name__ == "__main__":
    # Initialize fetcher
    fetcher = ResourceFetcher(server_url="https://your-server.vercel.app")
    
    # Login (chỉ cần làm 1 lần, sau đó token được lưu)
    # fetcher.login("your_username", "your_password")
    
    # Fetch resources
    resources = fetcher.fetch_resources()
    
    if resources:
        print("\n📊 Resources fetched successfully!")
        print(f"API Keys: {len(resources.get('api_keys', []))}")
        print(f"Proxies: {len(resources.get('proxies', []))}")
        print(f"Rotating Keys: {len(resources.get('rotating_proxy_keys', []))}")


