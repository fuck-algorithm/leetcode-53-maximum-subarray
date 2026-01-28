import { useState } from 'react'
import MaxSubarrayVisualizer from './components/MaxSubarrayVisualizer'
import AlgorithmExplanation from './components/AlgorithmExplanation'
import CodeImplementation from './components/CodeImplementation'
import { Book, Play, Code } from 'lucide-react'
import './App.css'

type Tab = 'explanation' | 'visualization' | 'code'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('visualization')

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>🎯 最大子数组和算法</h1>
            <p className="subtitle">LeetCode 53 - Kadane's Algorithm</p>
          </div>
          
          <nav className="navigation">
            <button
              className={`nav-btn ${activeTab === 'explanation' ? 'active' : ''}`}
              onClick={() => setActiveTab('explanation')}
            >
              <Book size={20} />
              <span>算法讲解</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'visualization' ? 'active' : ''}`}
              onClick={() => setActiveTab('visualization')}
            >
              <Play size={20} />
              <span>可视化演示</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code size={20} />
              <span>代码实现</span>
            </button>
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        {activeTab === 'explanation' && <AlgorithmExplanation />}
        {activeTab === 'visualization' && <MaxSubarrayVisualizer />}
        {activeTab === 'code' && <CodeImplementation />}
      </main>
    </div>
  )
}

export default App
