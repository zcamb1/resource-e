# Tool Integration Guide

Hướng dẫn tích hợp Resource Fetcher vào ElevenLabs Tool.

## 1. Copy File

Copy `resource_fetcher.py` vào thư mục `src/` của tool:

```
d:\backup project\elevenlab tool\src\resource_fetcher.py
```

## 2. Tích Hợp Vào BatchTabUI

Mở file `src/batch/ui_components/batch_tab.py` và thêm code sau:

### Import Resource Fetcher

```python
from src.resource_fetcher import ResourceFetcher
```

### Trong `__init__` của BatchTabUI

```python
def __init__(self, parent, batch_manager):
    # ... existing code ...
    
    # 🌐 Initialize Resource Fetcher
    self.resource_fetcher = ResourceFetcher(
        server_url="https://your-server.vercel.app"  # Change to your actual URL
    )
    
    # 🚀 Auto-fetch resources on startup (if configured)
    self.parent.after(2000, self.auto_fetch_resources)
```

### Thêm Method Auto-Fetch

```python
def auto_fetch_resources(self):
    """
    Tự động fetch resources từ server khi tool khởi động
    Chỉ fetch nếu chưa có API keys hoặc proxies
    """
    try:
        # Check if we need to fetch
        existing_keys = len(self.api_key_manager.api_keys)
        existing_proxies = len(self.proxy_manager.proxies)
        
        print(f"[ResourceFetch] Current: {existing_keys} keys, {existing_proxies} proxies")
        
        # Nếu đã có đủ resources thì skip
        if existing_keys >= 10 and existing_proxies >= 5:
            print("[ResourceFetch] Already have enough resources, skip auto-fetch")
            return
        
        # Fetch resources from server
        print("[ResourceFetch] 🌐 Auto-fetching resources from server...")
        resources = self.resource_fetcher.fetch_resources()
        
        if not resources:
            print("[ResourceFetch] ⚠️ No resources fetched (maybe not logged in)")
            return
        
        # Apply API keys
        api_keys = resources.get('api_keys', [])
        if api_keys:
            added = self.resource_fetcher.apply_api_keys_to_database(
                self.db_manager,
                api_keys
            )
            if added > 0:
                # Reload API keys
                self.api_key_manager.load_api_keys_from_db()
                print(f"[ResourceFetch] ✅ Added {added} API keys")
        
        # Apply proxies
        proxies = resources.get('proxies', [])
        if proxies:
            added = self.resource_fetcher.apply_proxies_to_manager(
                self.proxy_manager,
                proxies
            )
            if added > 0:
                # Refresh proxy table nếu có
                if hasattr(self.proxy_manager, 'refresh_proxy_table'):
                    self.proxy_manager.proxy_table.after(0, self.proxy_manager.refresh_proxy_table)
                print(f"[ResourceFetch] ✅ Added {added} proxies")
        
        # Apply rotating proxy keys
        rotating_keys = resources.get('rotating_proxy_keys', [])
        if rotating_keys:
            added = self.resource_fetcher.apply_rotating_keys_to_manager(
                self.proxy_manager,
                rotating_keys
            )
            if added > 0:
                print(f"[ResourceFetch] ✅ Started {added} rotating proxy key(s)")
        
        print("[ResourceFetch] ✅ Auto-fetch completed!")
        
    except Exception as e:
        print(f"[ResourceFetch] ❌ Error during auto-fetch: {e}")
        # Không throw error, chỉ log - tool vẫn hoạt động bình thường
```

### Thêm Login UI (Optional - trong menu)

```python
def open_resource_login_dialog(self):
    """Dialog để login vào Resource Management Server"""
    import tkinter as tk
    from tkinter import messagebox
    
    dialog = tk.Toplevel(self.parent)
    dialog.title("Login to Resource Server")
    dialog.geometry("400x250")
    dialog.transient(self.parent)
    dialog.grab_set()
    
    # Username
    tk.Label(dialog, text="Username:", font=("Arial", 12)).pack(pady=(20, 5))
    username_entry = tk.Entry(dialog, width=30, font=("Arial", 12))
    username_entry.pack(pady=5)
    
    # Password
    tk.Label(dialog, text="Password:", font=("Arial", 12)).pack(pady=5)
    password_entry = tk.Entry(dialog, width=30, font=("Arial", 12), show="*")
    password_entry.pack(pady=5)
    
    # Login button
    def do_login():
        username = username_entry.get().strip()
        password = password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("Error", "Please enter username and password")
            return
        
        # Show loading
        login_btn.config(text="Logging in...", state="disabled")
        dialog.update()
        
        # Login
        success = self.resource_fetcher.login(username, password)
        
        if success:
            messagebox.showinfo("Success", "Login successful!\nResources will be fetched automatically.")
            dialog.destroy()
            # Fetch ngay sau khi login
            self.auto_fetch_resources()
        else:
            messagebox.showerror("Error", "Login failed. Check username/password.")
            login_btn.config(text="Login", state="normal")
    
    login_btn = tk.Button(
        dialog,
        text="Login",
        command=do_login,
        width=20,
        font=("Arial", 12, "bold"),
        bg="#4CAF50",
        fg="white"
    )
    login_btn.pack(pady=20)
```

## 3. Thêm Menu Item (Optional)

Trong file menu của tool, thêm option:

```python
# Trong menu bar
resource_menu = tk.Menu(menubar, tearoff=0)
resource_menu.add_command(
    label="🌐 Login to Resource Server",
    command=self.batch_tab.open_resource_login_dialog
)
resource_menu.add_command(
    label="🔄 Fetch Resources Now",
    command=self.batch_tab.auto_fetch_resources
)
menubar.add_cascade(label="Resources", menu=resource_menu)
```

## 4. Testing

1. Chạy tool
2. Tool sẽ tự động fetch resources sau 2 giây
3. Nếu chưa login, mở menu "Resources" → "Login to Resource Server"
4. Sau khi login, resources sẽ được fetch tự động

## 5. Configuration

File `resource_config.json` sẽ được tạo tự động sau khi login:

```json
{
  "user_id": "uuid-here",
  "token": "jwt-token-here"
}
```

Token có thời hạn 30 ngày, sau đó cần login lại.

## Notes

- Auto-fetch chỉ chạy nếu tool chưa có đủ resources (< 10 keys hoặc < 5 proxies)
- Nếu fetch fail, tool vẫn hoạt động bình thường với resources hiện có
- Có thể manual fetch bất cứ lúc nào qua menu


