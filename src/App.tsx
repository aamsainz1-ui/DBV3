import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 dark:text-purple-100 mb-2">
            True Wallet Dashboard
          </h1>
          <p className="text-purple-600 dark:text-purple-300">
            ธีมสีม่วง (Purple Theme)
          </p>
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
              Primary Color
            </h3>
            <div className="w-full h-16 bg-purple-600 rounded-lg mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">#7C3AED</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
              Secondary Color
            </h3>
            <div className="w-full h-16 bg-purple-500 rounded-lg mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">#A855F7</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">
              Accent Color
            </h3>
            <div className="w-full h-16 bg-purple-400 rounded-lg mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">#C084FC</p>
          </div>
        </div>

        {/* Interactive Components */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6">
            UI Components
          </h2>
          
          <div className="space-y-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Primary Button
            </button>
            
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors ml-4">
              Secondary Button
            </button>
            
            <button className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors ml-4">
              Accent Button
            </button>
          </div>
          
          <div className="mt-8">
            <div className="bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <p className="text-purple-800 dark:text-purple-200">
                ธีมสีม่วงใช้โทนสีม่วงเป็นหลัก สร้างความรู้สึกที่อบอุ่นและเป็นมิตร
              </p>
            </div>
          </div>
          
          {/* Counter Demo */}
          <div className="mt-8 text-center">
            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4">
                Interactive Demo
              </h3>
              <button 
                onClick={() => setCount((count) => count + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Count: {count}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
