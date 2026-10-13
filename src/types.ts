/**
 * LeetCode 53 最大子数组和 —— 动画步骤类型定义
 * 参照父目录样例（121 股票 / 1143 LCS）的 AnimationStep 范式：
 * 每一步对应代码中的一行执行，携带多语言代码高亮行与变量状态。
 */

export type Language = 'javascript' | 'python' | 'java' | 'cpp'

/**
 * 代码执行阶段 —— 对应 Kadane 算法中的每一行
 * - init: 初始化 currentSum = 0, maxSum = nums[0]
 * - read: 读取当前元素 num = nums[i]
 * - reset-check: 判断 if (currentSum < 0)
 * - reset: 执行 currentSum = 0（抛弃负累积）
 * - accumulate: 执行 currentSum += num
 * - max-update: 执行 maxSum = Math.max(maxSum, currentSum)
 * - return: 返回 maxSum
 */
export type CodePhase =
  | 'init'
  | 'read'
  | 'reset-check'
  | 'reset'
  | 'accumulate'
  | 'max-update'
  | 'return'

/**
 * 变量状态 —— 当前步骤所有变量的值
 */
export interface VariableState {
  currentSum: number
  maxSum: number
  num: number
  currentStart: number
  bestStart: number
  bestEnd: number
}

/**
 * 动画步骤
 */
export interface AlgorithmStep {
  /** 当前处理的元素下标（-1 表示尚未开始） */
  index: number
  /** 当前阶段的变量快照 */
  variables: VariableState
  /** 当前子数组的起点 */
  currentStart: number
  /** 最佳子数组范围 */
  bestStart: number
  bestEnd: number
  /** 人类可读的步骤说明 */
  description: string
  /** 各语言代码中当前高亮的行号 */
  highlightLines: Record<Language, number[]>
  /** 代码执行阶段 */
  phase: CodePhase
  /** 这一步是否更新了最大和 */
  updatedMax: boolean
  /** 这一步是否重置了当前和（抛弃负累积） */
  didReset: boolean
}

/** 数组上一步的「架构」：哪些位置处于什么状态 */
export interface ArrayMarkup {
  /** 当前处理位置 */
  currentIndex: number
  /** 最佳子数组范围 */
  bestStart: number
  bestEnd: number
  /** 当前子数组起点 */
  currentStart: number
}