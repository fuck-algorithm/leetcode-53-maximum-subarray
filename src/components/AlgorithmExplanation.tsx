import './AlgorithmExplanation.css'

const AlgorithmExplanation = () => {
  return (
    <div className="explanation-page">
      <div className="explanation-container">
        <section className="explanation-section">
          <h2 className="section-title">
            <span className="section-icon">🎮</span>
            问题是什么？
          </h2>
          <div className="section-content">
            <p>
              给你一个整数数组，找出其中<strong>连续的一段</strong>，让这段数字的<strong>和最大</strong>。
            </p>
            <div className="example-box">
              <div className="example-title">示例：</div>
              <div className="example-content">
                <div>数组：<code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code></div>
                <div className="example-answer">答案：<code>[4, -1, 2, 1]</code>，和为 <strong>6</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="explanation-section">
          <h2 className="section-title">
            <span className="section-icon">💡</span>
            核心思想（用生活例子理解）
          </h2>
          <div className="section-content">
            <p className="intro-text">
              想象你在做生意，每天赚钱或赔钱。<strong>连续哪几天赚得最多？</strong>
            </p>
            
            <div className="life-example">
              <div className="day-row">
                <div className="day-badge positive">第1天</div>
                <div className="day-action">+10元</div>
                <div className="day-result">→ 累计 <strong>10元</strong> ✅</div>
              </div>
              <div className="day-row">
                <div className="day-badge positive">第2天</div>
                <div className="day-action">-5元</div>
                <div className="day-result">→ 累计 <strong>5元</strong> ✅ (还是正的，继续！)</div>
              </div>
              <div className="day-row">
                <div className="day-badge positive">第3天</div>
                <div className="day-action">+3元</div>
                <div className="day-result">→ 累计 <strong>8元</strong> ✅</div>
              </div>
              
              <div className="critical-moment">
                <div className="moment-title">⚡ 关键时刻 ⚡</div>
                <div className="moment-content">
                  <p>如果累计变成<strong className="negative">负数</strong>（比如 -8元），遇到新的一天（+5元）：</p>
                  <div className="choice-box">
                    <div className="choice bad">
                      <div className="choice-label">❌ 继续前面</div>
                      <div className="choice-calc">-8 + 5 = <strong>-3元</strong></div>
                      <div className="choice-desc">还在亏损！</div>
                    </div>
                    <div className="vs">VS</div>
                    <div className="choice good">
                      <div className="choice-label">✅ 重新开始</div>
                      <div className="choice-calc">直接从 <strong>5元</strong> 开始</div>
                      <div className="choice-desc">更好的选择！</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="explanation-section">
          <h2 className="section-title">
            <span className="section-icon">🔑</span>
            算法的关键决策
          </h2>
          <div className="section-content">
            <div className="decision-grid">
              <div className="decision-card positive-card">
                <div className="decision-header">
                  <div className="decision-condition">如果累积和 ≥ 0</div>
                </div>
                <div className="decision-action">→ 继续累加</div>
                <div className="decision-reason">正数有帮助，能让后续的和更大</div>
              </div>
              
              <div className="decision-card negative-card">
                <div className="decision-header">
                  <div className="decision-condition">如果累积和 &lt; 0</div>
                </div>
                <div className="decision-action">→ 抛弃它，重新开始</div>
                <div className="decision-reason">负数会拖累，不如从下一个数开始</div>
              </div>
            </div>
            
            <div className="why-works">
              <div className="why-title">🤔 为什么这样做是对的？</div>
              <div className="why-content">
                <p>
                  因为：<code>负数 + 任何数</code> 永远比 <code>直接从这个数开始</code> 更小！
                </p>
                <p className="math-formula">
                  数学上：如果 A &lt; 0，那么 <strong>A + B &lt; B</strong>（对任意B都成立）
                </p>
                <div className="concrete-example">
                  <div className="example-line">
                    <span className="example-label">例如：</span>
                    <code>-5 + 3 = -2</code>
                    <span className="comparison">比</span>
                    <code>3</code>
                    <span className="result">更小 ❌</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="explanation-section">
          <h2 className="section-title">
            <span className="section-icon">⚡</span>
            为什么超级快？
          </h2>
          <div className="section-content">
            <div className="complexity-comparison">
              <div className="complexity-method bad-method">
                <div className="method-header">
                  <div className="method-label">❌ 暴力方法</div>
                  <div className="method-time">O(n²)</div>
                </div>
                <div className="method-desc">试遍所有可能的连续子数组</div>
                <div className="method-example">
                  <div>100个元素 → 约 <strong>5,000</strong> 次计算</div>
                  <div>1000个元素 → 约 <strong>500,000</strong> 次计算</div>
                </div>
              </div>
              
              <div className="vs-separator">
                <div className="vs-badge">VS</div>
              </div>
              
              <div className="complexity-method good-method">
                <div className="method-header">
                  <div className="method-label">✅ Kadane 算法</div>
                  <div className="method-time">O(n)</div>
                </div>
                <div className="method-desc">只扫描一遍数组</div>
                <div className="method-example">
                  <div>100个元素 → 只要 <strong>100</strong> 次计算</div>
                  <div>1000个元素 → 只要 <strong>1,000</strong> 次计算</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="explanation-section highlight-section">
          <h2 className="section-title">
            <span className="section-icon">🎯</span>
            记住这句话
          </h2>
          <div className="section-content">
            <div className="key-takeaway">
              <div className="takeaway-main">
                "负数是累赘，遇到就扔掉，重新开始！"
              </div>
              <div className="takeaway-sub">
                一路记录见过的最大和，最后它就是答案 🎉
              </div>
            </div>
          </div>
        </section>

        <section className="explanation-section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            算法步骤
          </h2>
          <div className="section-content">
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-title">初始化</div>
                  <div className="step-desc">
                    <code>currentSum = 0</code>（当前子数组的和）<br/>
                    <code>maxSum = 数组第一个元素</code>（记录最大和）
                  </div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-title">遍历数组每个元素</div>
                  <div className="step-desc">从第一个元素开始，一个一个地处理</div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-title">判断是否要抛弃前面的累积</div>
                  <div className="step-desc">
                    如果 <code>currentSum &lt; 0</code>，就让 <code>currentSum = 0</code>
                  </div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <div className="step-title">加上当前元素</div>
                  <div className="step-desc">
                    <code>currentSum = currentSum + 当前元素</code>
                  </div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">5</div>
                <div className="step-content">
                  <div className="step-title">更新最大和</div>
                  <div className="step-desc">
                    如果 <code>currentSum &gt; maxSum</code>，更新 <code>maxSum = currentSum</code>
                  </div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">6</div>
                <div className="step-content">
                  <div className="step-title">返回结果</div>
                  <div className="step-desc">
                    遍历完成后，<code>maxSum</code> 就是答案
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AlgorithmExplanation
