/** Curated datasets powering gap recommendations and company readiness. */

export type Diff = 'Easy' | 'Medium' | 'Hard'

export interface Problem {
  title: string
  slug: string
  difficulty: Diff
}

/** A handful of canonical problems per core topic, easy → hard. */
export const PROBLEMS_BY_TOPIC: Record<string, Problem[]> = {
  Array: [
    { title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' },
    { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy' },
    { title: 'Majority Element', slug: 'majority-element', difficulty: 'Easy' },
    { title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium' },
    { title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium' },
  ],
  String: [
    { title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy' },
    { title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy' },
    { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium' },
    { title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium' },
  ],
  'Hash Table': [
    { title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy' },
    { title: 'Ransom Note', slug: 'ransom-note', difficulty: 'Easy' },
    { title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium' },
    { title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', difficulty: 'Medium' },
  ],
  'Dynamic Programming': [
    { title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy' },
    { title: 'House Robber', slug: 'house-robber', difficulty: 'Medium' },
    { title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium' },
    { title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium' },
    { title: 'Edit Distance', slug: 'edit-distance', difficulty: 'Hard' },
  ],
  Tree: [
    { title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy' },
    { title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy' },
    { title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium' },
    { title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium' },
  ],
  Graph: [
    { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
    { title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium' },
    { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
    { title: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard' },
  ],
  'Binary Search': [
    { title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy' },
    { title: 'Search Insert Position', slug: 'search-insert-position', difficulty: 'Easy' },
    { title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium' },
    { title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium' },
  ],
  'Two Pointers': [
    { title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy' },
    { title: 'Two Sum II', slug: 'two-sum-ii-input-array-is-sorted', difficulty: 'Medium' },
    { title: '3Sum', slug: '3sum', difficulty: 'Medium' },
    { title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium' },
  ],
  'Linked List': [
    { title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy' },
    { title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy' },
    { title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy' },
    { title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium' },
  ],
  Stack: [
    { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy' },
    { title: 'Min Stack', slug: 'min-stack', difficulty: 'Medium' },
    { title: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium' },
    { title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard' },
  ],
  'Heap (Priority Queue)': [
    { title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', difficulty: 'Medium' },
    { title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium' },
    { title: 'Find Median from Data Stream', slug: 'find-median-from-data-stream', difficulty: 'Hard' },
  ],
  'Sliding Window': [
    { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy' },
    { title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', difficulty: 'Medium' },
    { title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard' },
  ],
  Backtracking: [
    { title: 'Subsets', slug: 'subsets', difficulty: 'Medium' },
    { title: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium' },
    { title: 'Permutations', slug: 'permutations', difficulty: 'Medium' },
    { title: 'N-Queens', slug: 'n-queens', difficulty: 'Hard' },
  ],
  Greedy: [
    { title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium' },
    { title: 'Jump Game', slug: 'jump-game', difficulty: 'Medium' },
    { title: 'Gas Station', slug: 'gas-station', difficulty: 'Medium' },
  ],
  Trie: [
    { title: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree', difficulty: 'Medium' },
    { title: 'Design Add and Search Words', slug: 'design-add-and-search-words-data-structure', difficulty: 'Medium' },
    { title: 'Word Search II', slug: 'word-search-ii', difficulty: 'Hard' },
  ],
  'Bit Manipulation': [
    { title: 'Single Number', slug: 'single-number', difficulty: 'Easy' },
    { title: 'Number of 1 Bits', slug: 'number-of-1-bits', difficulty: 'Easy' },
    { title: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy' },
    { title: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium' },
  ],
}

/** How many solves in a topic we treat as "covered" for readiness. */
export const COVERED_AT = 6

/**
 * Company interview profiles: topic → relative weight. Approximate, curated
 * from commonly-reported interview focus (not official). Used to estimate
 * readiness and highlight focus areas.
 */
export const COMPANY_PROFILES: Record<string, Record<string, number>> = {
  Google: {
    Graph: 3, 'Dynamic Programming': 3, Array: 2, Tree: 2, Backtracking: 2, String: 1, Greedy: 1,
  },
  Amazon: {
    Array: 3, 'Hash Table': 2, Tree: 2, Graph: 2, 'Dynamic Programming': 2, String: 2, 'Linked List': 1,
  },
  Meta: {
    Array: 3, String: 2, Tree: 2, Graph: 2, 'Hash Table': 2, 'Binary Search': 1, 'Dynamic Programming': 1,
  },
  Microsoft: {
    Array: 2, String: 2, Tree: 2, 'Linked List': 2, 'Dynamic Programming': 2, Stack: 1, Graph: 1,
  },
  Apple: {
    Array: 2, String: 2, 'Linked List': 2, Tree: 1, 'Dynamic Programming': 1, 'Hash Table': 1,
  },
}

export const COMPANIES = Object.keys(COMPANY_PROFILES)
