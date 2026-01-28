import { useState } from 'react'
import './CodeImplementation.css'

type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp'

const CodeImplementation = () => {
  const [activeLanguage, setActiveLanguage] = useState<Language>('javascript')

  return (
    <div className="code-page">
      <div className="code-container">
        {/* 语言选择标签 */}
        <div className="language-tabs">
          <button
            className={`lang-tab ${activeLanguage === 'javascript' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('javascript')}
          >
            <span className="lang-badge js">JS</span>
            JavaScript
          </button>
          <button
            className={`lang-tab ${activeLanguage === 'typescript' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('typescript')}
          >
            <span className="lang-badge ts">TS</span>
            TypeScript
          </button>
          <button
            className={`lang-tab ${activeLanguage === 'python' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('python')}
          >
            <span className="lang-badge py">PY</span>
            Python
          </button>
          <button
            className={`lang-tab ${activeLanguage === 'java' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('java')}
          >
            <span className="lang-badge java">Java</span>
            Java
          </button>
          <button
            className={`lang-tab ${activeLanguage === 'cpp' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('cpp')}
          >
            <span className="lang-badge cpp">C++</span>
            C++
          </button>
        </div>

        {/* JavaScript */}
        {activeLanguage === 'javascript' && (
          <section className="code-section">
            <h2 className="code-section-title">
              <span className="lang-badge js">JavaScript</span>
              Kadane 算法实现
            </h2>
          
          <div className="code-block">
            <div className="code-header">
              <span className="code-filename">maxSubArray.js</span>
              <span className="code-desc">最简洁的实现</span>
            </div>
            <pre className="code-content"><code>{`function maxSubArray(nums) {
  let currentSum = 0;
  let maxSum = nums[0];
  
  for (let num of nums) {
    // 如果累积和是负数，就抛弃它
    if (currentSum < 0) {
      currentSum = 0;
    }
    
    // 加上当前元素
    currentSum += num;
    
    // 更新最大值
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// 测试
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 输出: 6
console.log(maxSubArray([1])); // 输出: 1
console.log(maxSubArray([5,4,-1,7,8])); // 输出: 23`}</code></pre>
          </div>

          <div className="code-block">
            <div className="code-header">
              <span className="code-filename">maxSubArray2.js</span>
              <span className="code-desc">更直观的写法</span>
            </div>
            <pre className="code-content"><code>{`function maxSubArray(nums) {
  let currentSum = 0;
  let maxSum = nums[0];
  
  for (let i = 0; i < nums.length; i++) {
    // 关键决策：要不要前面的累积？
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    
    // 更新最大值
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`}</code></pre>
          </div>
          
          <div className="code-explanation">
            <h3>💡 代码解释</h3>
            <ul>
              <li><code>currentSum</code>：当前子数组的和</li>
              <li><code>maxSum</code>：目前见过的最大和</li>
              <li><code>Math.max(nums[i], currentSum + nums[i])</code>：选择"重新开始"还是"继续累加"</li>
            </ul>
          </div>
          </section>
        )}

        {/* TypeScript */}
        {activeLanguage === 'typescript' && (
          <section className="code-section">
            <h2 className="code-section-title">
              <span className="lang-badge ts">TypeScript</span>
              TypeScript 版本
            </h2>
          
          <div className="code-block">
            <pre className="code-content"><code>{`function maxSubArray(nums: number[]): number {
  let currentSum = 0;
  let maxSum = nums[0];
  
  for (const num of nums) {
    if (currentSum < 0) {
      currentSum = 0;
    }
    currentSum += num;
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`}</code></pre>
          </div>
          </section>
        )}

        {/* Python */}
        {activeLanguage === 'python' && (
          <section className="code-section">
            <h2 className="code-section-title">
              <span className="lang-badge py">Python</span>
              Python 版本
            </h2>
          
          <div className="code-block">
            <pre className="code-content"><code>{`def maxSubArray(nums):
    current_sum = 0
    max_sum = nums[0]
    
    for num in nums:
        # 如果累积和是负数，就抛弃它
        if current_sum < 0:
            current_sum = 0
        
        # 加上当前元素
        current_sum += num
        
        # 更新最大值
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# 测试
print(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # 输出: 6
print(maxSubArray([1]))  # 输出: 1
print(maxSubArray([5,4,-1,7,8]))  # 输出: 23`}</code></pre>
          </div>
          
          <div className="code-block">
            <div className="code-header">
              <span className="code-filename">简洁版</span>
            </div>
            <pre className="code-content"><code>{`def maxSubArray(nums):
    current_sum = 0
    max_sum = nums[0]
    
    for num in nums:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum`}</code></pre>
          </div>
          </section>
        )}

        {/* Java */}
        {activeLanguage === 'java' && (
          <section className="code-section">
            <h2 className="code-section-title">
              <span className="lang-badge java">Java</span>
              Java 版本
            </h2>
          
          <div className="code-block">
            <pre className="code-content"><code>{`class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = 0;
        int maxSum = nums[0];
        
        for (int num : nums) {
            // 如果累积和是负数，就抛弃它
            if (currentSum < 0) {
                currentSum = 0;
            }
            
            // 加上当前元素
            currentSum += num;
            
            // 更新最大值
            maxSum = Math.max(maxSum, currentSum);
        }
        
        return maxSum;
    }
}`}</code></pre>
          </div>
          </section>
        )}

        {/* C++ */}
        {activeLanguage === 'cpp' && (
          <section className="code-section">
            <h2 className="code-section-title">
              <span className="lang-badge cpp">C++</span>
              C++ 版本
            </h2>
          
          <div className="code-block">
            <pre className="code-content"><code>{`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int currentSum = 0;
        int maxSum = nums[0];
        
        for (int num : nums) {
            // 如果累积和是负数，就抛弃它
            if (currentSum < 0) {
                currentSum = 0;
            }
            
            // 加上当前元素
            currentSum += num;
            
            // 更新最大值
            maxSum = max(maxSum, currentSum);
        }
        
        return maxSum;
    }
};`}</code></pre>
          </div>
          </section>
        )}

        {/* 复杂度分析 - 所有语言共享 */}
        <section className="code-section complexity-section">
          <h2 className="code-section-title">
            <span className="section-icon">📊</span>
            复杂度分析
          </h2>
          
          <div className="complexity-grid">
            <div className="complexity-item">
              <div className="complexity-label">时间复杂度</div>
              <div className="complexity-value">O(n)</div>
              <div className="complexity-desc">只需要遍历数组一次</div>
            </div>
            
            <div className="complexity-item">
              <div className="complexity-label">空间复杂度</div>
              <div className="complexity-value">O(1)</div>
              <div className="complexity-desc">只使用了常数个变量</div>
            </div>
          </div>
        </section>

        <section className="code-section">
          <h2 className="code-section-title">
            <span className="section-icon">🎯</span>
            关键点总结
          </h2>
          
          <div className="key-points">
            <div className="key-point">
              <div className="point-icon">1️⃣</div>
              <div className="point-content">
                <strong>核心变量</strong>：currentSum（当前和）和 maxSum（最大和）
              </div>
            </div>
            
            <div className="key-point">
              <div className="point-icon">2️⃣</div>
              <div className="point-content">
                <strong>关键判断</strong>：if (currentSum &lt; 0) 时重置为 0
              </div>
            </div>
            
            <div className="key-point">
              <div className="point-icon">3️⃣</div>
              <div className="point-content">
                <strong>持续更新</strong>：每步都更新 maxSum，确保不错过最大值
              </div>
            </div>
            
            <div className="key-point">
              <div className="point-icon">4️⃣</div>
              <div className="point-content">
                <strong>边界情况</strong>：数组只有一个元素时，直接返回该元素
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CodeImplementation
