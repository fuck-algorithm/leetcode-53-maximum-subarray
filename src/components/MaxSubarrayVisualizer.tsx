import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react'
import './MaxSubarrayVisualizer.css'

interface Step {
  index: number
  currentSum: number
  maxSum: number
  currentStart: number
  bestStart: number
  bestEnd: number
  explanation: string
}

const MaxSubarrayVisualizer = () => {
  // 示例数组
  const examples = [
    { name: '示例 1', array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    { name: '示例 2', array: [1] },
    { name: '示例 3', array: [5, 4, -1, 7, 8] },
    { name: '复杂示例', array: [-3, 2, -1, 4, -2, 3, -5, 6, -1, 2] },
  ]

  const [nums, setNums] = useState<number[]>(examples[0].array)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [customInput, setCustomInput] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  // 计算 Kadane 算法的所有步骤
  const calculateSteps = (array: number[]): Step[] => {
    const stepsList: Step[] = []
    let currentSum = 0
    let maxSum = array[0]
    let currentStart = 0
    let bestStart = 0
    let bestEnd = 0

    // 初始状态
    stepsList.push({
      index: -1,
      currentSum: 0,
      maxSum: array[0],
      currentStart: 0,
      bestStart: 0,
      bestEnd: 0,
      explanation: '初始化：准备开始遍历数组',
    })

    for (let i = 0; i < array.length; i++) {
      // 更新当前和
      currentSum += array[i]
      
      // 检查是否需要重新开始
      if (currentSum < array[i]) {
        currentSum = array[i]
        currentStart = i
        stepsList.push({
          index: i,
          currentSum,
          maxSum,
          currentStart,
          bestStart,
          bestEnd,
          explanation: `位置 ${i}：当前和 (${currentSum - array[i]}) 小于当前元素 ${array[i]}，重新开始计数`,
        })
      } else {
        stepsList.push({
          index: i,
          currentSum,
          maxSum,
          currentStart,
          bestStart,
          bestEnd,
          explanation: `位置 ${i}：加上当前元素 ${array[i]}，当前和为 ${currentSum}`,
        })
      }

      // 更新最大和
      if (currentSum > maxSum) {
        maxSum = currentSum
        bestStart = currentStart
        bestEnd = i
        stepsList.push({
          index: i,
          currentSum,
          maxSum,
          currentStart,
          bestStart,
          bestEnd,
          explanation: `🎉 找到新的最大和 ${maxSum}！子数组范围：[${bestStart}, ${bestEnd}]`,
        })
      }
    }

    // 最终结果
    stepsList.push({
      index: array.length,
      currentSum,
      maxSum,
      currentStart,
      bestStart,
      bestEnd,
      explanation: `✅ 完成！最大子数组和为 ${maxSum}，子数组为 [${array.slice(bestStart, bestEnd + 1).join(', ')}]`,
    })

    return stepsList
  }

  // 初始化步骤
  useEffect(() => {
    const newSteps = calculateSteps(nums)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [nums])

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, speed)

    return () => clearInterval(timer)
  }, [isPlaying, steps.length, speed])

  // D3 可视化
  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 40, right: 20, bottom: 60, left: 20 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const step = steps[currentStep]
    const barWidth = Math.min(chartWidth / nums.length, 80)
    const barSpacing = barWidth * 0.1

    // 计算 Y 轴范围
    const maxValue = Math.max(...nums.map(Math.abs))
    const yScale = d3
      .scaleLinear()
      .domain([-maxValue, maxValue])
      .range([chartHeight, 0])

    // 绘制 X 轴
    const xAxis = g.append('g').attr('transform', `translate(0,${chartHeight / 2})`)
    xAxis
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)

    // 绘制柱状图
    nums.forEach((value, index) => {
      const x = index * barWidth + barSpacing
      const barHeight = Math.abs(yScale(value) - yScale(0))
      const y = value >= 0 ? yScale(value) : yScale(0)

      // 判断柱子的状态
      let fillColor = value >= 0 ? '#fbbf24' : '#f87171'
      let strokeColor = 'none'
      let strokeWidth = 0

      if (step.index >= 0) {
        // 当前正在处理的元素
        if (index === step.index) {
          strokeColor = '#f59e0b'
          strokeWidth = 3
        }
        // 最佳子数组范围
        else if (index >= step.bestStart && index <= step.bestEnd) {
          fillColor = value >= 0 ? '#34d399' : '#fbbf24'
          strokeColor = '#10b981'
          strokeWidth = 2
        }
        // 当前子数组范围
        else if (index >= step.currentStart && index <= step.index) {
          fillColor = value >= 0 ? '#fde68a' : '#fca5a5'
        }
      }

      // 绘制柱子
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

      // 数值标签
      bar
        .append('text')
        .attr('x', x + (barWidth - barSpacing * 2) / 2)
        .attr('y', y + (value >= 0 ? -5 : barHeight + 15))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(value)

      // 索引标签
      bar
        .append('text')
        .attr('x', x + (barWidth - barSpacing * 2) / 2)
        .attr('y', chartHeight / 2 + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#6b7280')
        .text(`[${index}]`)
    })

    // 显示当前状态信息
    if (step.index >= 0) {
      const infoGroup = g.append('g').attr('class', 'info-group')

      infoGroup
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1f2937')
        .text(`当前和: ${step.currentSum} | 最大和: ${step.maxSum}`)
    }
  }, [nums, steps, currentStep])

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
    setIsPlaying(false)
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
    setIsPlaying(false)
  }

  const handleSpeedChange = (faster: boolean) => {
    setSpeed((prev) => (faster ? Math.max(200, prev - 200) : Math.min(3000, prev + 200)))
  }

  const handleExampleChange = (exampleIndex: number) => {
    setNums(examples[exampleIndex].array)
    setCustomInput('')
  }

  const handleCustomInput = () => {
    try {
      // 解析输入的数组，支持多种格式
      const input = customInput.trim()
      if (!input) return

      // 移除可能的括号和空格，分割数字
      const cleanInput = input.replace(/[\[\]]/g, '')
      const numbers = cleanInput
        .split(/[,\s]+/)
        .filter((s) => s)
        .map((s) => {
          const num = parseFloat(s)
          if (isNaN(num)) throw new Error('Invalid number')
          return num
        })

      if (numbers.length === 0) {
        alert('请输入至少一个数字')
        return
      }

      if (numbers.length > 20) {
        alert('数组长度不要超过 20 个元素')
        return
      }

      setNums(numbers)
    } catch (error) {
      alert('输入格式错误！请输入数字，用逗号或空格分隔，例如：-2,1,-3,4,-1,2,1,-5,4')
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="visualizer-container">
      {/* 顶部控制区 */}
      <div className="top-control-area">
        {/* 左侧：示例和自定义输入 */}
        <div className="input-section">
          <div className="example-buttons">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleChange(index)}
                className={`example-btn ${
                  JSON.stringify(nums) === JSON.stringify(example.array) && !customInput
                    ? 'active'
                    : ''
                }`}
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
              onKeyPress={(e) => e.key === 'Enter' && handleCustomInput()}
              placeholder="自定义数组，例如：-2,1,-3,4,-1,2,1,-5,4"
              className="custom-input-field"
            />
            <button onClick={handleCustomInput} className="apply-btn">
              应用
            </button>
          </div>
        </div>
      </div>

      {/* 可视化区域 */}
      <div className="visualization-area">
        <svg ref={svgRef} className="visualization-svg"></svg>
      </div>

      {/* 步骤说明和控制面板合并 */}
      <div className="bottom-control-area">
        {/* 步骤说明 */}
        {currentStepData && (
          <div className="step-explanation-inline">
            <span className="step-number">
              步骤 {currentStep + 1}/{steps.length}
            </span>
            <span className="step-description">{currentStepData.explanation}</span>
          </div>
        )}

        {/* 控制面板 */}
        <div className="control-panel-inline">
          <div className="playback-controls">
            <button onClick={handleReset} className="control-btn-sm" title="重置">
              <RotateCcw size={16} />
            </button>
            <button onClick={handlePrevious} className="control-btn-sm" title="上一步">
              ←
            </button>
            <button onClick={handlePlayPause} className="control-btn-sm primary" title="播放/暂停">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={handleNext} className="control-btn-sm" title="下一步">
              →
            </button>
          </div>

          <div className="speed-control">
            <button onClick={() => handleSpeedChange(false)} className="speed-btn-sm" title="减速">
              <Minus size={14} />
            </button>
            <span className="speed-display">{(1000 / speed).toFixed(1)}x</span>
            <button onClick={() => handleSpeedChange(true)} className="speed-btn-sm" title="加速">
              <Plus size={14} />
            </button>
          </div>

          {/* 图例 */}
          <div className="legend-inline">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>当前</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#fde68a' }}></div>
              <span>当前子数组</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#34d399' }}></div>
              <span>最佳子数组</span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="progress-bar">
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={(e) => {
              setCurrentStep(parseInt(e.target.value))
              setIsPlaying(false)
            }}
            className="progress-slider"
          />
        </div>
      </div>
    </div>
  )
}

export default MaxSubarrayVisualizer
