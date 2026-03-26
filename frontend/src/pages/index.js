import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SocialShare</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white">
        <h2 className="text-5xl font-bold mb-4">Post to All Platforms at Once</h2>
        <p className="text-xl mb-8">Manage Instagram, TikTok, LinkedIn, YouTube, Facebook & Twitter from one place</p>
        <Link 
          href="/register" 
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 inline-block"
        >
          Get Started Free
        </Link>

        <div className="grid grid-cols-3 gap-8 mt-20">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">📱 All Platforms</h3>
            <p>Connect all your social accounts in seconds</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">📅 Schedule Posts</h3>
            <p>Plan and automate your content strategy</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">📊 Analytics</h3>
            <p>Track your performance across networks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
