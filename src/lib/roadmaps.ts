/** Curated study roadmaps, tracked as checklists with local progress. */

export interface RoadmapProblem {
  title: string
  slug: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  group: string
  /** Optional explicit URL (for non-LeetCode problems, e.g. GeeksforGeeks). */
  url?: string
}

/** Direct link to solve a problem (LeetCode by default). */
export function problemUrl(p: RoadmapProblem): string {
  return p.url ?? `https://leetcode.com/problems/${p.slug}/`
}

const BLIND_75: RoadmapProblem[] = [
  // Array
  { group: 'Array', title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' },
  { group: 'Array', title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy' },
  { group: 'Array', title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy' },
  { group: 'Array', title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium' },
  { group: 'Array', title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium' },
  { group: 'Array', title: 'Maximum Product Subarray', slug: 'maximum-product-subarray', difficulty: 'Medium' },
  { group: 'Array', title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium' },
  { group: 'Array', title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium' },
  { group: 'Array', title: '3Sum', slug: '3sum', difficulty: 'Medium' },
  { group: 'Array', title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium' },
  // Binary
  { group: 'Binary', title: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium' },
  { group: 'Binary', title: 'Number of 1 Bits', slug: 'number-of-1-bits', difficulty: 'Easy' },
  { group: 'Binary', title: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy' },
  { group: 'Binary', title: 'Missing Number', slug: 'missing-number', difficulty: 'Easy' },
  { group: 'Binary', title: 'Reverse Bits', slug: 'reverse-bits', difficulty: 'Easy' },
  // Dynamic Programming
  { group: 'Dynamic Programming', title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy' },
  { group: 'Dynamic Programming', title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Longest Common Subsequence', slug: 'longest-common-subsequence', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Word Break', slug: 'word-break', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Combination Sum IV', slug: 'combination-sum-iv', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'House Robber', slug: 'house-robber', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'House Robber II', slug: 'house-robber-ii', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Decode Ways', slug: 'decode-ways', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Unique Paths', slug: 'unique-paths', difficulty: 'Medium' },
  { group: 'Dynamic Programming', title: 'Jump Game', slug: 'jump-game', difficulty: 'Medium' },
  // Graph
  { group: 'Graph', title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium' },
  { group: 'Graph', title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
  { group: 'Graph', title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'Medium' },
  { group: 'Graph', title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
  { group: 'Graph', title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', difficulty: 'Medium' },
  { group: 'Graph', title: 'Alien Dictionary', slug: 'alien-dictionary', difficulty: 'Hard' },
  { group: 'Graph', title: 'Graph Valid Tree', slug: 'graph-valid-tree', difficulty: 'Medium' },
  { group: 'Graph', title: 'Number of Connected Components', slug: 'number-of-connected-components-in-an-undirected-graph', difficulty: 'Medium' },
  // Interval
  { group: 'Interval', title: 'Insert Interval', slug: 'insert-interval', difficulty: 'Medium' },
  { group: 'Interval', title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium' },
  { group: 'Interval', title: 'Non-overlapping Intervals', slug: 'non-overlapping-intervals', difficulty: 'Medium' },
  { group: 'Interval', title: 'Meeting Rooms', slug: 'meeting-rooms', difficulty: 'Easy' },
  { group: 'Interval', title: 'Meeting Rooms II', slug: 'meeting-rooms-ii', difficulty: 'Medium' },
  // Linked List
  { group: 'Linked List', title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy' },
  { group: 'Linked List', title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy' },
  { group: 'Linked List', title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy' },
  { group: 'Linked List', title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'Hard' },
  { group: 'Linked List', title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium' },
  { group: 'Linked List', title: 'Reorder List', slug: 'reorder-list', difficulty: 'Medium' },
  // Matrix
  { group: 'Matrix', title: 'Set Matrix Zeroes', slug: 'set-matrix-zeroes', difficulty: 'Medium' },
  { group: 'Matrix', title: 'Spiral Matrix', slug: 'spiral-matrix', difficulty: 'Medium' },
  { group: 'Matrix', title: 'Rotate Image', slug: 'rotate-image', difficulty: 'Medium' },
  { group: 'Matrix', title: 'Word Search', slug: 'word-search', difficulty: 'Medium' },
  // String
  { group: 'String', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium' },
  { group: 'String', title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', difficulty: 'Medium' },
  { group: 'String', title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard' },
  { group: 'String', title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy' },
  { group: 'String', title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium' },
  { group: 'String', title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy' },
  { group: 'String', title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy' },
  { group: 'String', title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'Medium' },
  { group: 'String', title: 'Palindromic Substrings', slug: 'palindromic-substrings', difficulty: 'Medium' },
  { group: 'String', title: 'Encode and Decode Strings', slug: 'encode-and-decode-strings', difficulty: 'Medium' },
  // Tree
  { group: 'Tree', title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy' },
  { group: 'Tree', title: 'Same Tree', slug: 'same-tree', difficulty: 'Easy' },
  { group: 'Tree', title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy' },
  { group: 'Tree', title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', difficulty: 'Hard' },
  { group: 'Tree', title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium' },
  { group: 'Tree', title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard' },
  { group: 'Tree', title: 'Subtree of Another Tree', slug: 'subtree-of-another-tree', difficulty: 'Easy' },
  { group: 'Tree', title: 'Construct Binary Tree from Preorder and Inorder', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium' },
  { group: 'Tree', title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium' },
  { group: 'Tree', title: 'Kth Smallest Element in a BST', slug: 'kth-smallest-element-in-a-bst', difficulty: 'Medium' },
  { group: 'Tree', title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium' },
  { group: 'Tree', title: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree', difficulty: 'Medium' },
  { group: 'Tree', title: 'Add and Search Word', slug: 'design-add-and-search-words-data-structure', difficulty: 'Medium' },
  { group: 'Tree', title: 'Word Search II', slug: 'word-search-ii', difficulty: 'Hard' },
  // Heap
  { group: 'Heap', title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium' },
  { group: 'Heap', title: 'Find Median from Data Stream', slug: 'find-median-from-data-stream', difficulty: 'Hard' },
]

const N = (
  group: string,
  title: string,
  slug: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
): RoadmapProblem => ({ group, title, slug, difficulty })

const NEETCODE_150: RoadmapProblem[] = [
  N('Arrays & Hashing', 'Contains Duplicate', 'contains-duplicate', 'Easy'),
  N('Arrays & Hashing', 'Valid Anagram', 'valid-anagram', 'Easy'),
  N('Arrays & Hashing', 'Two Sum', 'two-sum', 'Easy'),
  N('Arrays & Hashing', 'Group Anagrams', 'group-anagrams', 'Medium'),
  N('Arrays & Hashing', 'Top K Frequent Elements', 'top-k-frequent-elements', 'Medium'),
  N('Arrays & Hashing', 'Product of Array Except Self', 'product-of-array-except-self', 'Medium'),
  N('Arrays & Hashing', 'Valid Sudoku', 'valid-sudoku', 'Medium'),
  N('Arrays & Hashing', 'Encode and Decode Strings', 'encode-and-decode-strings', 'Medium'),
  N('Arrays & Hashing', 'Longest Consecutive Sequence', 'longest-consecutive-sequence', 'Medium'),
  N('Two Pointers', 'Valid Palindrome', 'valid-palindrome', 'Easy'),
  N('Two Pointers', 'Two Sum II', 'two-sum-ii-input-array-is-sorted', 'Medium'),
  N('Two Pointers', '3Sum', '3sum', 'Medium'),
  N('Two Pointers', 'Container With Most Water', 'container-with-most-water', 'Medium'),
  N('Two Pointers', 'Trapping Rain Water', 'trapping-rain-water', 'Hard'),
  N('Sliding Window', 'Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy'),
  N('Sliding Window', 'Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Medium'),
  N('Sliding Window', 'Longest Repeating Character Replacement', 'longest-repeating-character-replacement', 'Medium'),
  N('Sliding Window', 'Permutation in String', 'permutation-in-string', 'Medium'),
  N('Sliding Window', 'Minimum Window Substring', 'minimum-window-substring', 'Hard'),
  N('Sliding Window', 'Sliding Window Maximum', 'sliding-window-maximum', 'Hard'),
  N('Stack', 'Valid Parentheses', 'valid-parentheses', 'Easy'),
  N('Stack', 'Min Stack', 'min-stack', 'Medium'),
  N('Stack', 'Evaluate Reverse Polish Notation', 'evaluate-reverse-polish-notation', 'Medium'),
  N('Stack', 'Generate Parentheses', 'generate-parentheses', 'Medium'),
  N('Stack', 'Daily Temperatures', 'daily-temperatures', 'Medium'),
  N('Stack', 'Car Fleet', 'car-fleet', 'Medium'),
  N('Stack', 'Largest Rectangle in Histogram', 'largest-rectangle-in-histogram', 'Hard'),
  N('Binary Search', 'Binary Search', 'binary-search', 'Easy'),
  N('Binary Search', 'Search a 2D Matrix', 'search-a-2d-matrix', 'Medium'),
  N('Binary Search', 'Koko Eating Bananas', 'koko-eating-bananas', 'Medium'),
  N('Binary Search', 'Find Minimum in Rotated Sorted Array', 'find-minimum-in-rotated-sorted-array', 'Medium'),
  N('Binary Search', 'Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'Medium'),
  N('Binary Search', 'Time Based Key-Value Store', 'time-based-key-value-store', 'Medium'),
  N('Binary Search', 'Median of Two Sorted Arrays', 'median-of-two-sorted-arrays', 'Hard'),
  N('Linked List', 'Reverse Linked List', 'reverse-linked-list', 'Easy'),
  N('Linked List', 'Merge Two Sorted Lists', 'merge-two-sorted-lists', 'Easy'),
  N('Linked List', 'Reorder List', 'reorder-list', 'Medium'),
  N('Linked List', 'Remove Nth Node From End of List', 'remove-nth-node-from-end-of-list', 'Medium'),
  N('Linked List', 'Copy List with Random Pointer', 'copy-list-with-random-pointer', 'Medium'),
  N('Linked List', 'Add Two Numbers', 'add-two-numbers', 'Medium'),
  N('Linked List', 'Linked List Cycle', 'linked-list-cycle', 'Easy'),
  N('Linked List', 'Find the Duplicate Number', 'find-the-duplicate-number', 'Medium'),
  N('Linked List', 'LRU Cache', 'lru-cache', 'Medium'),
  N('Linked List', 'Merge k Sorted Lists', 'merge-k-sorted-lists', 'Hard'),
  N('Linked List', 'Reverse Nodes in k-Group', 'reverse-nodes-in-k-group', 'Hard'),
  N('Trees', 'Invert Binary Tree', 'invert-binary-tree', 'Easy'),
  N('Trees', 'Maximum Depth of Binary Tree', 'maximum-depth-of-binary-tree', 'Easy'),
  N('Trees', 'Diameter of Binary Tree', 'diameter-of-binary-tree', 'Easy'),
  N('Trees', 'Balanced Binary Tree', 'balanced-binary-tree', 'Easy'),
  N('Trees', 'Same Tree', 'same-tree', 'Easy'),
  N('Trees', 'Subtree of Another Tree', 'subtree-of-another-tree', 'Easy'),
  N('Trees', 'Lowest Common Ancestor of a BST', 'lowest-common-ancestor-of-a-binary-search-tree', 'Medium'),
  N('Trees', 'Binary Tree Level Order Traversal', 'binary-tree-level-order-traversal', 'Medium'),
  N('Trees', 'Binary Tree Right Side View', 'binary-tree-right-side-view', 'Medium'),
  N('Trees', 'Count Good Nodes in Binary Tree', 'count-good-nodes-in-binary-tree', 'Medium'),
  N('Trees', 'Validate Binary Search Tree', 'validate-binary-search-tree', 'Medium'),
  N('Trees', 'Kth Smallest Element in a BST', 'kth-smallest-element-in-a-bst', 'Medium'),
  N('Trees', 'Construct Binary Tree from Preorder and Inorder', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Medium'),
  N('Trees', 'Binary Tree Maximum Path Sum', 'binary-tree-maximum-path-sum', 'Hard'),
  N('Trees', 'Serialize and Deserialize Binary Tree', 'serialize-and-deserialize-binary-tree', 'Hard'),
  N('Tries', 'Implement Trie (Prefix Tree)', 'implement-trie-prefix-tree', 'Medium'),
  N('Tries', 'Design Add and Search Words', 'design-add-and-search-words-data-structure', 'Medium'),
  N('Tries', 'Word Search II', 'word-search-ii', 'Hard'),
  N('Heap / Priority Queue', 'Kth Largest Element in a Stream', 'kth-largest-element-in-a-stream', 'Easy'),
  N('Heap / Priority Queue', 'Last Stone Weight', 'last-stone-weight', 'Easy'),
  N('Heap / Priority Queue', 'K Closest Points to Origin', 'k-closest-points-to-origin', 'Medium'),
  N('Heap / Priority Queue', 'Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'Medium'),
  N('Heap / Priority Queue', 'Task Scheduler', 'task-scheduler', 'Medium'),
  N('Heap / Priority Queue', 'Design Twitter', 'design-twitter', 'Medium'),
  N('Heap / Priority Queue', 'Find Median from Data Stream', 'find-median-from-data-stream', 'Hard'),
  N('Backtracking', 'Subsets', 'subsets', 'Medium'),
  N('Backtracking', 'Combination Sum', 'combination-sum', 'Medium'),
  N('Backtracking', 'Permutations', 'permutations', 'Medium'),
  N('Backtracking', 'Subsets II', 'subsets-ii', 'Medium'),
  N('Backtracking', 'Combination Sum II', 'combination-sum-ii', 'Medium'),
  N('Backtracking', 'Word Search', 'word-search', 'Medium'),
  N('Backtracking', 'Palindrome Partitioning', 'palindrome-partitioning', 'Medium'),
  N('Backtracking', 'Letter Combinations of a Phone Number', 'letter-combinations-of-a-phone-number', 'Medium'),
  N('Backtracking', 'N-Queens', 'n-queens', 'Hard'),
  N('Graphs', 'Number of Islands', 'number-of-islands', 'Medium'),
  N('Graphs', 'Max Area of Island', 'max-area-of-island', 'Medium'),
  N('Graphs', 'Clone Graph', 'clone-graph', 'Medium'),
  N('Graphs', 'Walls and Gates', 'walls-and-gates', 'Medium'),
  N('Graphs', 'Rotting Oranges', 'rotting-oranges', 'Medium'),
  N('Graphs', 'Pacific Atlantic Water Flow', 'pacific-atlantic-water-flow', 'Medium'),
  N('Graphs', 'Surrounded Regions', 'surrounded-regions', 'Medium'),
  N('Graphs', 'Course Schedule', 'course-schedule', 'Medium'),
  N('Graphs', 'Course Schedule II', 'course-schedule-ii', 'Medium'),
  N('Graphs', 'Graph Valid Tree', 'graph-valid-tree', 'Medium'),
  N('Graphs', 'Number of Connected Components', 'number-of-connected-components-in-an-undirected-graph', 'Medium'),
  N('Graphs', 'Redundant Connection', 'redundant-connection', 'Medium'),
  N('Graphs', 'Word Ladder', 'word-ladder', 'Hard'),
  N('Advanced Graphs', 'Reconstruct Itinerary', 'reconstruct-itinerary', 'Hard'),
  N('Advanced Graphs', 'Min Cost to Connect All Points', 'min-cost-to-connect-all-points', 'Medium'),
  N('Advanced Graphs', 'Network Delay Time', 'network-delay-time', 'Medium'),
  N('Advanced Graphs', 'Swim in Rising Water', 'swim-in-rising-water', 'Hard'),
  N('Advanced Graphs', 'Alien Dictionary', 'alien-dictionary', 'Hard'),
  N('Advanced Graphs', 'Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'Medium'),
  N('1-D DP', 'Climbing Stairs', 'climbing-stairs', 'Easy'),
  N('1-D DP', 'Min Cost Climbing Stairs', 'min-cost-climbing-stairs', 'Easy'),
  N('1-D DP', 'House Robber', 'house-robber', 'Medium'),
  N('1-D DP', 'House Robber II', 'house-robber-ii', 'Medium'),
  N('1-D DP', 'Longest Palindromic Substring', 'longest-palindromic-substring', 'Medium'),
  N('1-D DP', 'Palindromic Substrings', 'palindromic-substrings', 'Medium'),
  N('1-D DP', 'Decode Ways', 'decode-ways', 'Medium'),
  N('1-D DP', 'Coin Change', 'coin-change', 'Medium'),
  N('1-D DP', 'Maximum Product Subarray', 'maximum-product-subarray', 'Medium'),
  N('1-D DP', 'Word Break', 'word-break', 'Medium'),
  N('1-D DP', 'Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Medium'),
  N('1-D DP', 'Partition Equal Subset Sum', 'partition-equal-subset-sum', 'Medium'),
  N('2-D DP', 'Unique Paths', 'unique-paths', 'Medium'),
  N('2-D DP', 'Longest Common Subsequence', 'longest-common-subsequence', 'Medium'),
  N('2-D DP', 'Best Time to Buy/Sell Stock with Cooldown', 'best-time-to-buy-and-sell-stock-with-cooldown', 'Medium'),
  N('2-D DP', 'Coin Change II', 'coin-change-ii', 'Medium'),
  N('2-D DP', 'Target Sum', 'target-sum', 'Medium'),
  N('2-D DP', 'Interleaving String', 'interleaving-string', 'Medium'),
  N('2-D DP', 'Longest Increasing Path in a Matrix', 'longest-increasing-path-in-a-matrix', 'Hard'),
  N('2-D DP', 'Distinct Subsequences', 'distinct-subsequences', 'Hard'),
  N('2-D DP', 'Edit Distance', 'edit-distance', 'Medium'),
  N('2-D DP', 'Burst Balloons', 'burst-balloons', 'Hard'),
  N('2-D DP', 'Regular Expression Matching', 'regular-expression-matching', 'Hard'),
  N('Greedy', 'Maximum Subarray', 'maximum-subarray', 'Medium'),
  N('Greedy', 'Jump Game', 'jump-game', 'Medium'),
  N('Greedy', 'Jump Game II', 'jump-game-ii', 'Medium'),
  N('Greedy', 'Gas Station', 'gas-station', 'Medium'),
  N('Greedy', 'Hand of Straights', 'hand-of-straights', 'Medium'),
  N('Greedy', 'Merge Triplets to Form Target Triplet', 'merge-triplets-to-form-target-triplet', 'Medium'),
  N('Greedy', 'Partition Labels', 'partition-labels', 'Medium'),
  N('Greedy', 'Valid Parenthesis String', 'valid-parenthesis-string', 'Medium'),
  N('Intervals', 'Insert Interval', 'insert-interval', 'Medium'),
  N('Intervals', 'Merge Intervals', 'merge-intervals', 'Medium'),
  N('Intervals', 'Non-overlapping Intervals', 'non-overlapping-intervals', 'Medium'),
  N('Intervals', 'Meeting Rooms', 'meeting-rooms', 'Easy'),
  N('Intervals', 'Meeting Rooms II', 'meeting-rooms-ii', 'Medium'),
  N('Intervals', 'Minimum Interval to Include Each Query', 'minimum-interval-to-include-each-query', 'Hard'),
  N('Math & Geometry', 'Rotate Image', 'rotate-image', 'Medium'),
  N('Math & Geometry', 'Spiral Matrix', 'spiral-matrix', 'Medium'),
  N('Math & Geometry', 'Set Matrix Zeroes', 'set-matrix-zeroes', 'Medium'),
  N('Math & Geometry', 'Happy Number', 'happy-number', 'Easy'),
  N('Math & Geometry', 'Plus One', 'plus-one', 'Easy'),
  N('Math & Geometry', 'Pow(x, n)', 'powx-n', 'Medium'),
  N('Math & Geometry', 'Multiply Strings', 'multiply-strings', 'Medium'),
  N('Math & Geometry', 'Detect Squares', 'detect-squares', 'Medium'),
  N('Bit Manipulation', 'Single Number', 'single-number', 'Easy'),
  N('Bit Manipulation', 'Number of 1 Bits', 'number-of-1-bits', 'Easy'),
  N('Bit Manipulation', 'Counting Bits', 'counting-bits', 'Easy'),
  N('Bit Manipulation', 'Reverse Bits', 'reverse-bits', 'Easy'),
  N('Bit Manipulation', 'Missing Number', 'missing-number', 'Easy'),
  N('Bit Manipulation', 'Sum of Two Integers', 'sum-of-two-integers', 'Medium'),
  N('Bit Manipulation', 'Reverse Integer', 'reverse-integer', 'Medium'),
]

export const ROADMAPS: Record<string, RoadmapProblem[]> = {
  'Blind 75': BLIND_75,
  'NeetCode 150': NEETCODE_150,
}

export const ROADMAP_NAMES = Object.keys(ROADMAPS)

/* -------- local progress (manual + auto-detected) -------- */

const key = (r: string) => `leetcity:roadmap:${r.toLowerCase().replace(/\s+/g, '-')}`

export function loadDone(roadmap: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(roadmap))
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function saveDone(roadmap: string, done: Set<string>) {
  try {
    localStorage.setItem(key(roadmap), JSON.stringify([...done]))
  } catch {
    /* ignore */
  }
}
