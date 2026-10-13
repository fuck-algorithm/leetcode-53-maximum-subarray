import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Minus, PanelRightOpen } from 'lucide-react'
import type { AlgorithmStep } from '../types'
import { generateSteps } from '../core/kadane'
import { useAnimationController } from '../hooks/useAnimationController'
import CodePanel from './CodePanel'
import './MaxSubarrayVisualizer.css'

interface Example {
  name: string
  array: number[]
}

const EXAMPLES: Example[] = [
  { name: '示例 1', array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  { name: '示例 2', array: [1] },
  { name: '示例 3', array: [5, 4, -1, 7, 8] },
  { name: '复杂示例', array: [-3, 2, -1, 4, -2, 3, -5, 6, -1, 2] },
]

/**
 * 最大子数组和可视化 —— 参照父目录样例（121/1143）范式：
 * - 细粒度 step（每步对应一行代码）驱动
 * - 完整动画控制器（播放/暂停/上一步/下一步/重置/速度/进度条）
 * - D3 柱状图 + 随步骤联动的代码面板
 * - 支持预设示例与自定义输入
 */
const MaxSubarrayVisualizer = () => {
  const [nums, setNums] = useState<number[]>(EXAMPLES[0].array)
  const [customInput, setCustomInput] = useState('')
  const [activeExample, setActiveExample] = useState(0)
  const [isCodeOpen, setIsCodeOpen] = useState(() => !window.matchMedia('(max-width: 720px)').matches)
  const [chartRevision, setChartRevision] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  // 细粒度步骤生成
  const steps = useMemo<AlgorithmStep[]>(() => generateSteps(nums), [nums])
  const currentStepData = useRef<AlgorithmStep | null>(null)

  // 动画控制器
  const {
    currentStepIndex,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    canStepForward,
    canStepBackward,
  } = useAnimationController(steps, (step) => {
    currentStepData.current = step
  })

  // 当前步骤
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null
  const decision = currentStep?.decision
  const choiceText = decision?.choice === 'restart'
    ? '从当前数重新开始'
    : decision?.choice === 'extend'
      ? '保留前缀并接上当前数'
      : currentStep?.phase === 'init'
        ? '先从第一个数建立初始答案'
        : '遍历结束'
  const choiceReason = decision?.choice === 'restart'
    ? decision.previousSum === null
      ? '这是第一个元素，还没有前缀可接。'
      : `前缀和 ${decision.previousSum} 为负，接上只会让结果更小。`
    : decision?.choice === 'extend'
      ? `接续得到 ${decision.extendCandidate}，大于单独从当前数开始的 ${decision.restartCandidate}。`
      : currentStep?.phase === 'init'
        ? '初始最大值设为数组第一个元素，保证全负数时也有正确答案。'
        : '最终答案已确定。'

  // 切换示例
  const handleExampleChange = (index: number) => {
    setActiveExample(index)
    setNums(EXAMPLES[index].array)
    setCustomInput('')
    reset()
  }

  // 自定义输入解析（支持 [-2,1] 与 -2,1 两种格式）
  const handleCustomInput = useCallback(() => {
    try {
      const input = customInput.trim()
      if (!input) return
      const cleanInput = input.replace(/[\[\]]/g, '')
      const numbers = cleanInput
        .split(/[,\s]+/)
        .filter((s) => s)
        .map((s) => {
          const num = parseFloat(s)
          if (isNaN(num)) throw new Error('Invalid number')
          return num
        })
      if (numbers.length === 0) return alert('请输入至少一个数字')
      if (numbers.length > 20) return alert('数组长度不要超过 20 个元素')
      setNums(numbers)
      setActiveExample(-1)
      reset()
    } catch {
      alert('输入格式错误！例如：-2,1,-3,4,-1,2,1,-5,4')
    }
  }, [customInput, reset])

  // 播放/暂停切换
  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  // 速度步进
  const handleSpeedStep = (faster: boolean) => {
    setSpeed(faster ? Math.min(3, speed + 0.5) : Math.max(0.5, speed - 0.5))
  }

  // Redraw when the workspace changes width (especially when the code drawer opens/closes).
  useEffect(() => {
    const svg = svgRef.current
    const host = svg?.parentElement
    if (!svg || !host) return
    const observer = new ResizeObserver(() => setChartRevision((revision) => revision + 1))
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  // D3 柱状图渲染
  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 64, right: 24, bottom: 92, left: 24 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const step = currentStep
    const barWidth = Math.min(chartWidth / nums.length, 80)
    const barSpacing = barWidth * 0.1

    const maxAbs = Math.max(...nums.map(Math.abs), 1)
    const yScale = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([chartHeight, 0])
    const zeroY = yScale(0)
    const xCenter = (index: number) => index * barWidth + barWidth / 2

    // X 轴（y=0 处基线）
    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', zeroY)
      .attr('y2', zeroY)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)

    // 当前候选区间底色：范围和文字标签双重编码，不只靠颜色表达。
    if (step && step.decision.candidateStart !== null && step.decision.candidateEnd !== null) {
      const startX = step.decision.candidateStart * barWidth
      const endX = (step.decision.candidateEnd + 1) * barWidth
      g.append('rect')
        .attr('x', startX + 1)
        .attr('y', 0)
        .attr('width', Math.max(0, endX - startX - 2))
        .attr('height', chartHeight)
        .attr('fill', '#356ae6')
        .attr('opacity', 0.055)
        .attr('rx', 5)
    }

    // 当前候选/最佳区间端点括线与标签
    const drawRange = (start: number | null, end: number | null, y: number, color: string, label: string) => {
      if (start === null || end === null || end < start) return
      const left = xCenter(start)
      const right = xCenter(end)
      const range = g.append('g').attr('class', 'range-marker')
      range.append('path')
        .attr('d', `M${left},${y + 6} v-6 H${right} v6`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
      range.append('text')
        .attr('x', (left + right) / 2)
        .attr('y', y - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', color)
        .text(`${label} [${start}…${end}]`)
    }
    if (step?.decision.candidateStart !== null && step?.decision.candidateEnd !== null) {
      drawRange(step?.decision.candidateStart ?? null, step?.decision.candidateEnd ?? null, 15, '#356ae6', '本轮')
    }
    if (step && step.phase !== 'init' && step.bestEnd >= 0) {
      drawRange(step.bestStart, step.bestEnd, chartHeight + 43, '#168467', '最佳区间')
    }

    // 当前下标的执行游标
    if (step && step.index >= 0 && step.index < nums.length) {
      const cursorX = xCenter(step.index)
      g.append('line')
        .attr('x1', cursorX).attr('x2', cursorX)
        .attr('y1', 0).attr('y2', chartHeight)
        .attr('stroke', '#e08a24').attr('stroke-width', 1).attr('stroke-dasharray', '3 4').attr('opacity', 0.65)
      g.append('path')
        .attr('d', `M${cursorX - 4},-3 L${cursorX + 4},-3 L${cursorX},3 Z`)
        .attr('fill', '#e08a24')
    }

    // 柱子
    nums.forEach((value, index) => {
      const x = index * barWidth + barSpacing
      const barHeight = Math.abs(yScale(value) - zeroY)
      const y = value >= 0 ? yScale(value) : zeroY

      // 当前执行位置使用橙色描边，负值使用红色柱并由零线区分方向。
      let fillColor = value >= 0 ? '#356ae6' : '#c94c55'
      let strokeColor = 'none'
      let strokeWidth = 0
      const isCurrent = Boolean(step && index === step.index && step.index < nums.length)
      const isBest = Boolean(step && step.phase !== 'init' && index >= step.bestStart && index <= step.bestEnd)
      const isActive = Boolean(step && step.index >= 0 && index >= step.currentStart && index <= step.index)

      if (isActive) {
        fillColor = '#dce8ff'
      }
      if (isBest) {
        fillColor = '#168467'
      }
      if (isCurrent) {
        strokeColor = '#e08a24'
        strokeWidth = 3
      }

      const bar = g.append('g').attr('class', 'bar-group')
      bar.append('title').text(`下标 ${index} · 数值 ${value}${isCurrent ? ' · 当前处理' : ''}${isBest ? ' · 最优区间' : ''}`)
      bar
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', barWidth - barSpacing * 2)
        .attr('height', barHeight)
        .attr('fill', fillColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .attr('rx', 4)
        .style('transition', 'all 0.3s ease')

      bar
        .append('text')
        .attr('x', x + (barWidth - barSpacing * 2) / 2)
        .attr('y', y + (value >= 0 ? -7 : barHeight + 12))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#172236')
        .text(value)

      bar
        .append('text')
        .attr('x', x + (barWidth - barSpacing * 2) / 2)
        .attr('y', chartHeight + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#667085')
        .text(`[${index}]`)
    })

    // 顶部当前状态
    if (step) {
      const info = g
        .append('text')
        .attr('x', 0)
        .attr('y', -48)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', '#172236')
      info.text(`当前累计 ${step.variables.currentSum}   ·   历史最大 ${step.variables.maxSum}`)
    }
  }, [nums, steps, currentStep, chartRevision])

  return (
    <div className={`visualizer-container ${isCodeOpen ? 'code-open' : 'code-closed'}`}>
      <section className="trace-toolbar" aria-label="输入数组">
        <div className="toolbar-identity">
          <span className="trace-kicker">LEETCODE 53 <i>/</i> KADANE</span>
          <strong>最大子数组和</strong>
          <span className="complexity-inline">O(n) 时间 <b>·</b> O(1) 空间</span>
        </div>
        <div className="input-section">
          <div className="example-buttons">
            {EXAMPLES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleChange(index)}
                className={`example-btn ${activeExample === index ? 'active' : ''}`}
              >
                {example.name}
              </button>
            ))}
          </div>
          <div className="custom-input">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomInput()}
              placeholder="输入数组，例如 -2, 1, -3, 4"
              className="custom-input-field"
              aria-label="自定义整数数组"
            />
            <button onClick={handleCustomInput} className="apply-btn">应用</button>
          </div>
        </div>
      </section>

      <main className="workspace">
        <section className="visualization-area" aria-label="数组可视化">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="panel-kicker">ARRAY TRACE</span>
              <h2>连续子数组</h2>
            </div>
            <div className="chart-summary">
              <span><small>当前和</small><b>{currentStep?.variables.currentSum ?? '—'}</b></span>
              <span><small>最大和</small><b className="summary-best">{currentStep?.variables.maxSum ?? '—'}</b></span>
              <span><small>最佳区间</small><b className="summary-range">{currentStep && currentStep.phase !== 'init' ? `[${currentStep.bestStart}, ${currentStep.bestEnd}]` : '—'}</b></span>
            </div>
          </div>
          <div className={`learning-strip ${decision?.updatedMax ? 'record-frame' : ''}`} aria-live="polite">
            <div className="learning-step">
              <span className="learning-label">正在处理</span>
              <strong>{decision?.restartCandidate === null || decision?.restartCandidate === undefined ? '准备遍历数组' : `nums[${currentStep?.index}] = ${decision.restartCandidate}`}</strong>
              {decision?.choice !== 'none' && <span className="running-prefix">当前候选区间 [{decision?.candidateStart}, {decision?.candidateEnd}]</span>}
            </div>
            <div className="candidate-comparison">
              <span className={decision?.choice === 'extend' ? 'candidate chosen' : 'candidate'}>
                <small>接上前缀</small><b>{decision?.previousSum === null ? '无前缀' : decision?.extendCandidate ?? '—'}</b>
              </span>
              <span className="compare-sign">或</span>
              <span className={decision?.choice === 'restart' ? 'candidate chosen' : 'candidate'}>
                <small>从当前开始</small><b>{decision?.restartCandidate ?? '—'}</b>
              </span>
            </div>
            <div className="decision-explanation">
              <span className={`decision-mark ${decision?.choice ?? 'none'}`}>{decision?.choice === 'restart' ? '↳' : decision?.choice === 'extend' ? '+' : '·'}</span>
              <div><strong>{choiceText}</strong><small>{choiceReason}</small></div>
            </div>
            <div className={`best-change ${decision?.updatedMax ? 'changed' : ''}`}>
              <span>最佳和</span>
              <strong>{decision?.previousMax ?? '—'} <i>→</i> {decision?.nextMax ?? '—'}</strong>
              {decision?.updatedMax && <small>新纪录 · 区间 [{currentStep?.bestStart}, {currentStep?.bestEnd}]</small>}
            </div>
          </div>
          <svg ref={svgRef} className="visualization-svg" role="img" aria-label="输入数组的正负柱状图"></svg>
          <div className="chart-legend" aria-label="图表图例">
            <span><i className="legend-swatch swatch-positive" />正值柱</span>
            <span><i className="legend-swatch swatch-negative" />负值柱</span>
            <span><i className="legend-swatch swatch-current" />当前游标</span>
            <span><i className="legend-swatch swatch-active" />候选范围</span>
            <span><i className="legend-swatch swatch-best" />全局最佳</span>
          </div>
        </section>
        {!isCodeOpen && (
          <button className="code-rail" onClick={() => setIsCodeOpen(true)} aria-label="展开代码面板">
            <PanelRightOpen size={16} /><span>代码</span>
          </button>
        )}
        <aside className={`code-drawer ${isCodeOpen ? 'open' : ''}`} aria-label="代码执行面板" aria-hidden={!isCodeOpen}>
          {isCodeOpen && (
            <CodePanel
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              isOpen={isCodeOpen}
              onToggle={() => setIsCodeOpen(false)}
            />
          )}
        </aside>
      </main>

      <footer className="bottom-control-area">
        <div className="step-explanation-inline" aria-live="polite">
          <span className="step-number">
            {String(Math.max(currentStepIndex + 1, 0)).padStart(2, '0')} <i>/</i> {String(steps.length).padStart(2, '0')}
          </span>
          <span className="step-phase">{currentStep ? currentStep.phase : 'READY'}</span>
          <span className="step-description">
            {currentStep ? currentStep.description : '点击播放或逐步前进，查看 Kadane 算法如何找到最大子数组'}
          </span>
        </div>
        <div className="control-panel-inline">
          <div className="playback-controls" aria-label="动画控制">
            <button onClick={reset} className="control-btn-sm" title="重置" aria-label="重置动画"><RotateCcw size={16} /></button>
            <button onClick={stepBackward} disabled={!canStepBackward} className="control-btn-sm" title="上一步" aria-label="上一步"><SkipBack size={16} /></button>
            <button onClick={handlePlayPause} disabled={!canStepForward && !isPlaying} className="control-btn-sm primary" title="播放/暂停" aria-label={isPlaying ? '暂停动画' : '播放动画'}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={stepForward} disabled={!canStepForward} className="control-btn-sm" title="下一步" aria-label="下一步"><SkipForward size={16} /></button>
          </div>
          <div className="speed-control">
            <button onClick={() => handleSpeedStep(false)} disabled={speed <= 0.5} className="speed-btn-sm" title="减速"><Minus size={14} /></button>
            <span className="speed-display">{speed.toFixed(1)}x</span>
            <button onClick={() => handleSpeedStep(true)} disabled={speed >= 3} className="speed-btn-sm" title="加速"><Plus size={14} /></button>
          </div>
          <div className="progress-readout">{currentStepIndex + 1}<span>/</span>{steps.length}</div>
          <div className="progress-bar">
            <input type="range" min="0" max={Math.max(0, steps.length - 1)} value={currentStepIndex} onChange={(e) => goToStep(parseInt(e.target.value))} className="progress-slider" aria-label="动画进度" />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MaxSubarrayVisualizer