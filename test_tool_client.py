"""
Test script để mô phỏng tool Python lấy resources từ server
Run: python test_tool_client.py
"""

import requests
import json

# Server config
SERVER_URL = "http://localhost:3001"
USERNAME = "xzzz"  # Hoặc username bạn muốn test
PASSWORD = "123"   # Password của user đó

def login(username, password):
    """Login và lấy JWT token"""
    print(f"🔐 Đang login với user: {username}...")
    
    response = requests.post(
        f"{SERVER_URL}/api/auth/login",
        json={
            "username": username,
            "password": password
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        user_id = data.get('userId')
        print(f"✅ Login thành công!")
        print(f"   User ID: {user_id}")
        print(f"   Token: {token[:20]}...{token[-10:]}\n")
        return token, user_id
    else:
        print(f"❌ Login thất bại: {response.status_code}")
        print(f"   Response: {response.text}")
        return None, None

def get_resources(user_id, token=None):
    """Lấy resources của user từ server"""
    print(f"📦 Đang lấy resources cho user ID: {user_id}...")
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    response = requests.get(
        f"{SERVER_URL}/api/resources/{user_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        api_keys = data.get('api_keys', [])
        proxies = data.get('proxies', [])
        rotating_keys = data.get('rotating_proxy_keys', [])
        
        print(f"✅ Lấy resources thành công!\n")
        
        # Display API Keys
        print(f"🔑 API Keys: {len(api_keys)} keys")
        for i, key in enumerate(api_keys[:3], 1):  # Show first 3
            api_key = key.get('api_key', '')
            print(f"   {i}. {api_key[:10]}...{api_key[-10:]}")
        if len(api_keys) > 3:
            print(f"   ... và {len(api_keys) - 3} keys nữa")
        
        # Display Proxies
        print(f"\n🌐 Proxies: {len(proxies)} proxies")
        for i, proxy in enumerate(proxies[:3], 1):  # Show first 3
            proxy_url = proxy.get('proxy_url', 'N/A')
            print(f"   {i}. {proxy_url[:50]}")
        if len(proxies) > 3:
            print(f"   ... và {len(proxies) - 3} proxies nữa")
        
        # Display Rotating Keys
        print(f"\n🔄 Rotating Proxy Keys: {len(rotating_keys)} keys")
        for i, key in enumerate(rotating_keys[:3], 1):  # Show first 3
            api_key = key.get('api_key', '')
            print(f"   {i}. {api_key[:10]}...{api_key[-10:]}")
        if len(rotating_keys) > 3:
            print(f"   ... và {len(rotating_keys) - 3} keys nữa")
        
        # Save to file
        output_file = f"resources_{USERNAME}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Đã lưu vào file: {output_file}")
        
        return data
    else:
        print(f"❌ Lỗi lấy resources: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def main():
    print("=" * 60)
    print("🧪 TEST TOOL CLIENT - FETCH RESOURCES FROM SERVER")
    print("=" * 60)
    print()
    
    # Step 1: Login
    token, user_id = login(USERNAME, PASSWORD)
    
    if not token or not user_id:
        print("\n❌ Không thể tiếp tục test do login thất bại")
        return
    
    print("-" * 60)
    
    # Step 2: Get Resources
    resources = get_resources(user_id, token)
    
    if resources:
        print("\n" + "=" * 60)
        print("✅ TEST THÀNH CÔNG!")
        print("=" * 60)
        print("\n📝 Workflow cho tool thật:")
        print("   1. User nhập username/password trong tool")
        print("   2. Tool gọi /api/auth/login → lấy token + userId")
        print("   3. Tool gọi /api/resources/{userId} → lấy tất cả resources")
        print("   4. Tool load API keys, proxies, rotating keys vào memory")
        print("   5. Tool sẵn sàng xử lý batch!")
    else:
        print("\n❌ TEST THẤT BẠI!")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Không thể kết nối tới server!")
        print("   Đảm bảo server đang chạy: npm run dev")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

