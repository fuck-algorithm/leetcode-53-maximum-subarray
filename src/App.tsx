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
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden="true"><span className="brand-dot" /></span>
              <div>
                <p className="eyebrow">LEETCODE 53 · TRACE LAB</p>
                <h1>最大子数组和</h1>
              </div>
            </div>
            <p className="subtitle">Kadane's Algorithm · 连续区间的最优解</p>
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
