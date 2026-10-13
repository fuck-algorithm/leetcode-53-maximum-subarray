import { useState, useEffect, useCallback, useRef } from 'react'
import type { AlgorithmStep } from '../types'

interface UseAnimationControllerReturn {
  currentStepIndex: number
  isPlaying: boolean
  speed: number
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  goToStep: (index: number) => void
  reset: () => void
  setSpeed: (speed: number) => void
  canStepForward: boolean
  canStepBackward: boolean
}

/**
 * 通用动画控制器 —— 参照 1143 样例的 useAnimationController。
 * - currentStepIndex 从 -1 开始（表示"尚未开始"），与样例语义一致
 * - 播放/暂停/上一步/下一步/跳转/重置/速度调节
 * - 边界用禁用态（canStepForward/canStepBackward）表达
 */
export function useAnimationController(
  steps: AlgorithmStep[],
  onStepChange?: (step: AlgorithmStep | null, index: number) => void,
): UseAnimationControllerReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeedState] = useState(1)
  const intervalRef = useRef<number | null>(null)

  const canStepForward = currentStepIndex < steps.length - 1
  const canStepBackward = currentStepIndex > 0

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const goToStep = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(-1, Math.min(steps.length - 1, index))
      setCurrentStepIndex(clampedIndex)
      onStepChange?.(clampedIndex >= 0 ? steps[clampedIndex] : null, clampedIndex)
    },
    [steps, onStepChange],
  )

  const stepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1)
    } else {
      setIsPlaying(false)
      clearTimer()
    }
  }, [currentStepIndex, steps.length, goToStep, clearTimer])

  const stepBackward = useCallback(() => {
    if (currentStepIndex > -1) {
      goToStep(currentStepIndex - 1)
    }
  }, [currentStepIndex, goToStep])

  const play = useCallback(() => {
    if (canStepForward) {
      setIsPlaying(true)
    }
  }, [canStepForward])

  const pause = useCallback(() => {
    setIsPlaying(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    setIsPlaying(false)
    clearTimer()
    setCurrentStepIndex(0)
    onStepChange?.(steps[0] ?? null, 0)
  }, [clearTimer, onStepChange, steps])

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(0.5, Math.min(3, newSpeed)))
  }, [])

  // 自动播放：每 1000/speed 毫秒前进一步
  useEffect(() => {
    if (isPlaying && canStepForward) {
      const interval = 1000 / speed
      intervalRef.current = window.setInterval(() => stepForward(), interval)
    } else {
      clearTimer()
      if (!canStepForward) {
        setIsPlaying(false)
      }
    }
    return clearTimer
  }, [isPlaying, canStepForward, speed, stepForward, clearTimer])

  return {
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
  }
}
