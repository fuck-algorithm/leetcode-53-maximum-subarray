import { useState } from 'react'
import type { AlgorithmStep, Language } from '../types'
import { CODE_BY_LANGUAGE, highlightCode } from '../core/kadane'
import './CodePanel.css'

interface CodePanelProps {
  currentStep: AlgorithmStep | null
  currentStepIndex: number
  totalSteps: number
}

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'javascript', label: 'JS' },
  { key: 'python', label: 'PY' },
  { key: 'java', label: 'Java' },
  { key: 'cpp', label: 'C++' },
]

/**
 * 代码联动面板 —— 参照 121 样例的 CodePanel：
 * - 随动画步骤高亮当前执行的代码行
 * - 显示 currentSum / maxSum / num 等局部变量的实时值
 * - 支持多语言切换
 */
const CodePanel = ({ currentStep, currentStepIndex, totalSteps }: CodePanelProps) => {
  const [language, setLanguage] = useState<Language>('javascript')
  const code = CODE_BY_LANGUAGE[language]
  const codeLines = code.split('\n')
  const highlightLines = currentStep?.highlightLines[language] || []

  // 变量面板：始终显示 3 个核心变量 + 子数组范围
  const variables = currentStep
    ? [
        { name: 'currentSum', value: currentStep.variables.currentSum, updated: currentStep.phase === 'accumulate' || currentStep.didReset },
        { name: 'maxSum', value: currentStep.variables.maxSum, updated: currentStep.updatedMax },
        { name: 'num', value: currentStep.variables.num, updated: currentStep.phase === 'read' },
        { name: 'bestRange', value: `[${currentStep.bestStart}, ${currentStep.bestEnd}]`, updated: currentStep.updatedMax },
      ]
    : []

  const phaseLabels: Record<string, string> = {
    init: '初始化',
    read: '读取元素',
    'reset-check': '判断累积',
    reset: '抛弃负累积',
    accumulate: '累加',
    'max-update': '更新最大和',
    return: '返回结果',
  }

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <span className="code-panel-title">🧠 代码联动</span>
        <div className="lang-tabs">
          {LANGUAGES.map(({ key, label }) => (
            <button
              key={key}
              className={`lang-tab ${language === key ? 'active' : ''}`}
              onClick={() => setLanguage(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="code-lines">
        {codeLines.map((line, idx) => {
          const lineNum = idx + 1
          const isHighlighted = highlightLines.includes(lineNum)
          return (
            <div
              key={idx}
              className={`code-line ${isHighlighted ? 'highlighted' : ''} ${isHighlighted && currentStep ? `phase-${currentStep.phase}` : ''}`}
            >
              <span className="line-number">{lineNum}</span>
              <span
                className="line-content"
                dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
              />
            </div>
          )
        })}
      </div>

      <div className="variables-panel">
        <div className="variables-header">
          <span className="variables-title">🔬 局部变量</span>
          {currentStep && (
            <span className="phase-badge">
              {phaseLabels[currentStep.phase]}
              <span className="step-count"> step {currentStepIndex + 1}/{totalSteps}</span>
            </span>
          )}
        </div>
        <div className="variables-list">
          {variables.length === 0 ? (
            <div className="variables-empty">点击 ▶ 开始演示</div>
          ) : (
            variables.map((v) => (
              <div
                key={v.name}
                className={`variable-row ${v.updated ? 'updated' : ''}`}
              >
                <span className="var-name">{v.name}</span>
                <span className="var-eq">=</span>
                <span className="var-value">{String(v.value)}</span>
                {v.updated && <span className="var-flag">← 更新</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CodePanel
