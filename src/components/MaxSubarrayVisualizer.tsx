import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Minus } from 'lucide-react'
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

  // D3 柱状图渲染
  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 48, right: 20, bottom: 78, left: 20 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const step = currentStep
    const barWidth = Math.min(chartWidth / nums.length, 80)
    const barSpacing = barWidth * 0.1

    const maxAbs = Math.max(...nums.map(Math.abs), 1)
    const yScale = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([chartHeight, 0])
    const zeroY = yScale(0)

    // X 轴（y=0 处基线）
    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', zeroY)
      .attr('y2', zeroY)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)

    // 当前子数组范围高亮带
    if (step && step.index >= 0 && step.currentStart <= step.index) {
      const startX = step.currentStart * barWidth
      const endX = step.index * barWidth + barWidth
      g.append('rect')
        .attr('x', startX)
        .attr('y', 0)
        .attr('width', endX - startX)
        .attr('height', chartHeight)
        .attr('fill', '#356ae6')
        .attr('opacity', 0.08)
        .attr('rx', 6)
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
        .attr('y', -18)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', '#172236')
      info.text(`currentSum = ${step.variables.currentSum}   /   maxSum = ${step.variables.maxSum}`)
    }
  }, [nums, steps, currentStep])

  return (
    <div className="visualizer-container">
      {/* 顶部控制区 */}
      <section className="trace-toolbar" aria-label="输入数组">
        <div className="trace-toolbar-top">
          <div>
            <p className="trace-kicker">ALGORITHM TRACE / KADANE</p>
            <h2>沿着数组，追踪当前最优区间</h2>
          </div>
          <div className="complexity-pair" aria-label="算法复杂度">
            <span><b>O(n)</b><small>时间</small></span>
            <span><b>O(1)</b><small>空间</small></span>
          </div>
        </div>
        <div className="top-control-area">
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
              placeholder="自定义数组，例如：-2,1,-3,4,-1,2,1,-5,4"
              className="custom-input-field"
            />
            <button onClick={handleCustomInput} className="apply-btn">
              应用
            </button>
          </div>
        </div>
      </div>
      </section>

      {/* 主体：可视化 + 代码联动 双栏 */}
      <div className="main-layout">
        <section className="visualization-area" aria-label="数组可视化">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">ARRAY TRACE</span>
              <h3>数组状态</h3>
            </div>
            <div className="chart-summary">
              <span><small>当前和</small><b>{currentStep?.variables.currentSum ?? '—'}</b></span>
              <span><small>最大和</small><b className="summary-best">{currentStep?.variables.maxSum ?? '—'}</b></span>
              <span><small>最佳区间</small><b className="summary-range">{currentStep && currentStep.phase !== 'init' ? `[${currentStep.bestStart}, ${currentStep.bestEnd}]` : '—'}</b></span>
            </div>
          </div>
          <svg ref={svgRef} className="visualization-svg" role="img" aria-label="输入数组的正负柱状图"></svg>
          <div className="chart-legend" aria-label="图表图例">
            <span><i className="legend-swatch swatch-current" />当前元素</span>
            <span><i className="legend-swatch swatch-active" />当前子数组背景</span>
            <span><i className="legend-swatch swatch-best" />最佳子数组</span>
            <span><i className="legend-swatch swatch-negative" />负数</span>
          </div>
        </section>
        <div className="code-panel-area">
          <CodePanel
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
          />
        </div>
      </div>

      {/* 步骤说明 + 控制面板 */}
      <div className="bottom-control-area">
        <div className="step-explanation-inline" aria-live="polite">
          <span className="step-caption">CURRENT OPERATION</span>
          <span className="step-number">
            {String(Math.max(currentStepIndex + 1, 0)).padStart(2, '0')} <i>/</i> {String(steps.length).padStart(2, '0')}
          </span>
          <span className="step-phase">{currentStep ? currentStep.phase : 'READY'}</span>
          <span className="step-description">
            {currentStep ? currentStep.description : '点击 ▶ 或 → 开始逐步演示 Kadane 算法'}
          </span>
        </div>

        <div className="control-panel-inline">
          <div className="playback-controls" aria-label="动画控制">
            <button onClick={reset} className="control-btn-sm" title="重置" aria-label="重置动画">
              <RotateCcw size={16} />
            </button>
            <button
              onClick={stepBackward}
              disabled={!canStepBackward}
              className="control-btn-sm"
              title="上一步"
              aria-label="上一步"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!canStepForward && !isPlaying}
              className="control-btn-sm primary"
              title="播放/暂停"
              aria-label={isPlaying ? '暂停动画' : '播放动画'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={stepForward}
              disabled={!canStepForward}
              className="control-btn-sm"
              title="下一步"
              aria-label="下一步"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="speed-control">
            <button
              onClick={() => handleSpeedStep(false)}
              disabled={speed <= 0.5}
              className="speed-btn-sm"
              title="减速"
            >
              <Minus size={14} />
            </button>
            <span className="speed-display">{speed.toFixed(1)}x</span>
            <button
              onClick={() => handleSpeedStep(true)}
              disabled={speed >= 3}
              className="speed-btn-sm"
              title="加速"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="legend-inline">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e08a24' }}></div>
              <span>当前元素</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#356ae6' }}></div>
              <span>当前子数组</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#168467' }}></div>
              <span>最佳子数组</span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="progress-bar">
          <input
            type="range"
            min="0"
            max={Math.max(0, steps.length - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(parseInt(e.target.value))}
            className="progress-slider"
          />
        </div>
      </div>
    </div>
  )
}

export default MaxSubarrayVisualizer