import type { AlgorithmStep, CodePhase, Language } from '../types'

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

  const push = (
    index: number,
    phase: CodePhase,
    description: string,
    opts: { updatedMax?: boolean; didReset?: boolean } = {},
  ) => {
    steps.push({
      index,
      phase,
      description,
      variables: { currentSum, maxSum, num: index >= 0 && index < nums.length ? nums[index] : 0, currentStart, bestStart, bestEnd },
      currentStart,
      bestStart,
      bestEnd,
      highlightLines: PHASE_LINES[phase],
      updatedMax: opts.updatedMax ?? false,
      didReset: opts.didReset ?? false,
    })
  }

  push(-1, 'init', '初始化：currentSum = 0，maxSum = nums[0] = ' + nums[0])

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    push(i, 'read', `位置 ${i}：读取元素 nums[${i}] = ${num}`)

    if (currentSum < 0) {
      push(i, 'reset-check', `位置 ${i}：currentSum = ${currentSum} < 0，累积是负担，决定抛弃`)
      currentSum = 0
      currentStart = i
      push(i, 'reset', `位置 ${i}：currentSum 重置为 0，子数组从位置 ${i} 重新开始`, { didReset: true })
    } else {
      push(i, 'reset-check', `位置 ${i}：currentSum = ${currentSum} ≥ 0，继续累积`)
    }

    currentSum += num
    push(i, 'accumulate', `位置 ${i}：currentSum = ${currentSum - num} + ${num} = ${currentSum}`)

    if (currentSum > maxSum) {
      maxSum = currentSum
      bestStart = currentStart
      bestEnd = i
      push(i, 'max-update', `🎉 位置 ${i}：发现新最大和 ${maxSum}，最佳子数组变为 [${bestStart}, ${bestEnd}]`, { updatedMax: true })
    } else {
      push(i, 'max-update', `位置 ${i}：currentSum = ${currentSum} ≤ maxSum = ${maxSum}，保持不变`)
    }
  }

  push(nums.length, 'return', `✅ 完成！最大子数组和为 ${maxSum}，子数组为 [${nums.slice(bestStart, bestEnd + 1).join(', ')}]`)
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
