import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">🎙️ ElevenLabs Resource Manager</h1>
          <p className="text-blue-100">Quản lý API Keys và Proxies cho Tool</p>
          <div className="mt-4">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
            >
              🔐 Đăng nhập Quản Trị
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">🔑</div>
              <h3 className="font-bold text-lg mb-2">API Keys</h3>
              <p className="text-gray-600 text-sm">Quản lý API keys ElevenLabs</p>
            </div>
            <div className="text-center p-6 bg-indigo-50 rounded-xl">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-lg mb-2">Proxies</h3>
              <p className="text-gray-600 text-sm">Quản lý danh sách proxies</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-bold text-lg mb-2">Auto Sync</h3>
              <p className="text-gray-600 text-sm">Tool tự động lấy tài nguyên</p>
            </div>
          </div>

          {/* API Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-3">📡 API Endpoints</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">GET</span>
                <span>/api/resources/[userId]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">POST</span>
                <span>/api/auth/login</span>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">🚀 Quick Start</h3>
            <ol className="space-y-2 text-sm">
              <li>1. Tạo admin user trong Supabase (xem <code className="bg-white/20 px-2 py-1 rounded">SETUP_ADMIN.md</code>)</li>
              <li>2. Login vào dashboard để quản lý resources</li>
              <li>3. Tool sẽ tự động fetch resources từ server này</li>
            </ol>
          </div>

          {/* Links */}
          <div className="mt-8 flex gap-4 justify-center">
            <a
              href="https://github.com/your-repo/resource-management-server"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              📚 Documentation
            </a>
            <a
              href="/api/health"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              ✅ Health Check
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-gray-600 text-sm">
          Made with ❤️ for ElevenLabs Tool
        </div>
      </div>
    </div>
  );
}

