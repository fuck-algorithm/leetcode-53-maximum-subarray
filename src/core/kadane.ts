import type { AlgorithmStep, CodePhase, DecisionSnapshot, Language } from '../types'

/**
 * 各语言的核心实现代码。
 * 约定：阶段高亮行号对应代码中的真实行号（从 1 开始）。
 */

// JavaScript —— 用数组下标版，方便与可视化下标对应
export const KADANE_CODE_JS = `function maxSubArray(nums) {
  let currentSum = 0;      // 1  init: 当前子数组和
  let maxSum = nums[0];    // 2  init: 全局最大和
  let start = 0, end = 0;  // 3  init: 记录最佳子数组范围

  for (let i = 0; i < nums.length; i++) {   // 4  read: 遍历每个元素
    if (currentSum < 0) {                   // 5  reset-check: 累积为负?
      currentSum = 0;                       // 6  reset: 抛弃负累积
      start = i;                            // 7  reset: 子数组从这里重启
    }
    currentSum += nums[i];                  // 8  accumulate: 加入当前元素
    if (currentSum > maxSum) {              // 9  max-update: 刷新最大和?
      maxSum = currentSum;                  // 10 max-update: 记录新最大
      end = i;                              // 11 max-update: 记录新右端点
    }
  }
  return maxSum;                            // 12 return: 返回最大和
}`

export const KADANE_CODE_PYTHON = `def maxSubArray(nums):
    current_sum = 0        # 1 init: 当前子数组和
    max_sum = nums[0]      # 2 init: 全局最大和
    start = 0
    end = 0

    for i in range(len(nums)):   # 4 read
        if current_sum < 0:      # 5 reset-check
            current_sum = 0      # 6 reset
            start = i            # 7 reset
        current_sum += nums[i]   # 8 accumulate
        if current_sum > max_sum:  # 9 max-update
            max_sum = current_sum  # 10 max-update
            end = i                # 11 max-update
    return max_sum             # 12 return`

export const KADANE_CODE_JAVA = `class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = 0;          // 3  init
        int maxSum = nums[0];        // 4  init
        int start = 0, end = 0;
        for (int i = 0; i < nums.length; i++) {  // 6 read
            if (currentSum < 0) {                // 7 reset-check
                currentSum = 0;                  // 8 reset
                start = i;                       // 9 reset
            }
            currentSum += nums[i];               // 10 accumulate
            if (currentSum > maxSum) {           // 11 max-update
                maxSum = currentSum;             // 12 max-update
                end = i;                         // 13 max-update
            }
        }
        return maxSum;                           // 14 return
    }
}`

export const KADANE_CODE_CPP = `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int currentSum = 0;          // 3  init
        int maxSum = nums[0];        // 4  init
        int start = 0, end = 0;
        for (int i = 0; i < nums.size(); i++) {  // 6 read
            if (currentSum < 0) {                // 7 reset-check
                currentSum = 0;                  // 8 reset
                start = i;                       // 9 reset
            }
            currentSum += nums[i];               // 10 accumulate
            if (currentSum > maxSum) {           // 11 max-update
                maxSum = currentSum;             // 12 max-update
                end = i;                         // 13 max-update
            }
        }
        return maxSum;                           // 14 return
    }
};`

export const CODE_BY_LANGUAGE: Record<Language, string> = {
  javascript: KADANE_CODE_JS,
  python: KADANE_CODE_PYTHON,
  java: KADANE_CODE_JAVA,
  cpp: KADANE_CODE_CPP,
}

const PHASE_LINES: Record<CodePhase, Record<Language, number[]>> = {
  init: { javascript: [1, 2, 3], python: [1, 2, 3], java: [3, 4], cpp: [3, 4] },
  read: { javascript: [4], python: [4], java: [6], cpp: [6] },
  'reset-check': { javascript: [5], python: [5], java: [7], cpp: [7] },
  reset: { javascript: [6, 7], python: [6, 7], java: [8, 9], cpp: [8, 9] },
  accumulate: { javascript: [8], python: [8], java: [10], cpp: [10] },
  'max-update': { javascript: [9, 10, 11], python: [9, 10, 11], java: [11, 12, 13], cpp: [11, 12, 13] },
  return: { javascript: [12], python: [12], java: [14], cpp: [14] },
}

export function generateSteps(nums: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  if (nums.length === 0) return steps

  let currentSum = 0
  let maxSum = nums[0]
  let currentStart = 0
  let bestStart = 0
  let bestEnd = 0
  let decision: DecisionSnapshot = {
    previousSum: null,
    restartCandidate: null,
    extendCandidate: null,
    chosenCandidate: null,
    choice: 'none',
    previousMax: null,
    nextMax: maxSum,
    updatedMax: false,
    candidateStart: null,
    candidateEnd: null,
  }

  const push = (
    index: number,
    phase: CodePhase,
    description: string,
    opts: { updatedMax?: boolean; didReset?: boolean; decision?: DecisionSnapshot } = {},
  ) => {
    steps.push({
      index,
      phase,
      description,
      variables: { currentSum, maxSum, num: index >= 0 && index < nums.length ? nums[index] : 0, currentStart, bestStart, bestEnd },
      decision: opts.decision ?? decision,
      currentStart,
      bestStart,
      bestEnd,
      highlightLines: PHASE_LINES[phase],
      updatedMax: opts.updatedMax ?? false,
      didReset: opts.didReset ?? false,
    })
  }

  decision = { ...decision, nextMax: maxSum, candidateStart: 0, candidateEnd: 0 }
  push(-1, 'init', '初始化：currentSum = 0，maxSum = nums[0] = ' + nums[0])

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    const previousSum = i === 0 ? null : currentSum
    const previousMax = maxSum
    const extendCandidate = previousSum === null ? null : previousSum + num
    const restartCandidate = num
    const choice = previousSum === null || restartCandidate > (extendCandidate as number) ? 'restart' : 'extend'
    const candidateStart = choice === 'restart' ? i : currentStart
    const chosenCandidate = choice === 'restart' ? restartCandidate : (extendCandidate as number)
    const choiceDecision: DecisionSnapshot = {
      previousSum,
      restartCandidate,
      extendCandidate,
      chosenCandidate,
      choice,
      previousMax,
      nextMax: previousMax,
      updatedMax: false,
      candidateStart,
      candidateEnd: i,
    }
    decision = choiceDecision
    push(i, 'read', `位置 ${i}：读取 nums[${i}] = ${num}。比较从这里开始 ${restartCandidate} 与接上前缀 ${extendCandidate === null ? '（无前缀）' : extendCandidate}。`)

    if (previousSum !== null && previousSum < 0) {
      push(i, 'reset-check', `前缀和 ${previousSum} < 0：它会拖低后续结果，比较后选择从当前元素重启。`, { decision: choiceDecision })
      currentSum = 0
      currentStart = i
      push(i, 'reset', `丢弃负前缀，从 nums[${i}] = ${num} 重新开始。`, { didReset: true, decision: choiceDecision })
    } else {
      const explanation = previousSum === null
        ? `位置 ${i} 是起点，没有可接续的前缀；候选只有 ${num}。`
        : choice === 'restart'
          ? `重启候选 ${restartCandidate} ≥ 接续候选 ${extendCandidate}，从当前位置开始更优（相等时采用重启）。`
          : `接续候选 ${extendCandidate} > 重启候选 ${restartCandidate}，保留正前缀。`
      push(i, 'reset-check', explanation, { decision: choiceDecision })
      if (choice === 'restart') currentStart = i
    }

    currentSum = chosenCandidate
    push(i, 'accumulate', `${choice === 'restart' ? '重启' : '接续'}：${choice === 'restart' || previousSum === null ? `${num}` : `${previousSum} + ${num}`} = ${currentSum}。`, { decision: choiceDecision })

    const updatedMax = currentSum > maxSum
    if (updatedMax) {
      maxSum = currentSum
      bestStart = currentStart
      bestEnd = i
    }
    decision = {
      ...choiceDecision,
      nextMax: maxSum,
      updatedMax,
    }
    if (updatedMax) {
      push(i, 'max-update', `新最大值：${previousMax} → ${maxSum}，最佳区间更新为 [${bestStart}, ${bestEnd}]。`, { updatedMax: true, decision })
    } else {
      push(i, 'max-update', `当前和 ${currentSum} 没有超过历史最大值 ${maxSum}，最佳区间保持 [${bestStart}, ${bestEnd}]。`, { decision })
    }
  }

  push(nums.length, 'return', `完成：最大子数组和为 ${maxSum}，子数组为 [${nums.slice(bestStart, bestEnd + 1).join(', ')}]。`)
  return steps
}

const KEYWORD_SET = new Set([
  'function', 'let', 'const', 'var', 'if', 'else', 'for', 'return', 'class',
  'public', 'private', 'int', 'void', 'new', 'this', 'def', 'in', 'range',
  'vector', 'using', 'namespace', 'static', 'final', 'Solution',
])

/** Tokenize source text first, then escape and wrap tokens; generated markup is never re-parsed. */
export function highlightCode(code: string): string {
  return code.split('\n').map(highlightLine).join('\n')
}

function highlightLine(line: string): string {
  let result = ''
  let index = 0
  while (index < line.length) {
    const char = line[index]
    const next = line[index + 1]

    if ((char === '/' && next === '/') || char === '#') {
      result += `<span class="tok-comment">${escapeHtml(line.slice(index))}</span>`
      break
    }

    if (char === '"' || char === "'") {
      const quote = char
      let end = index + 1
      while (end < line.length) {
        if (line[end] === '\\\\') {
          end += 2
          continue
        }
        if (line[end] === quote) {
          end += 1
          break
        }
        end += 1
      }
      result += `<span class="tok-str">${escapeHtml(line.slice(index, end))}</span>`
      index = end
      continue
    }

    if (/[A-Za-z_$]/.test(char) || /\d/.test(char)) {
      let end = index + 1
      while (end < line.length && /[A-Za-z0-9_$]/.test(line[end])) end += 1
      const token = line.slice(index, end)
      const escaped = escapeHtml(token)
      if (KEYWORD_SET.has(token)) {
        result += `<span class="tok-kw">${escaped}</span>`
      } else if (/^\d+(?:\.\d+)?$/.test(token)) {
        result += `<span class="tok-num">${escaped}</span>`
      } else {
        result += escaped
      }
      index = end
      continue
    }

    result += escapeHtml(char)
    index += 1
  }
  return result
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
