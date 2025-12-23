'use client';

// Pre-defined valid "24" puzzles - each set of 4 numbers can make 24
const VALID_PUZZLES = [
  { numbers: [1, 2, 3, 4], hint: "(1 + 2 + 3) × 4" },
  { numbers: [1, 3, 4, 6], hint: "6 ÷ (1 - 3 ÷ 4)" },
  { numbers: [1, 4, 5, 6], hint: "4 ÷ (1 - 5 ÷ 6)" },
  { numbers: [1, 5, 5, 5], hint: "(5 - 1 ÷ 5) × 5" },
  { numbers: [2, 3, 4, 4], hint: "(2 + 4) × (4 - 3 + 3)" },
  { numbers: [2, 3, 3, 8], hint: "8 ÷ (3 - 8 ÷ 3)" },
  { numbers: [2, 2, 2, 3], hint: "2 × 2 × 2 × 3" },
  { numbers: [1, 1, 8, 3], hint: "(1 + 1 ÷ 8) × 3" },
  { numbers: [3, 3, 8, 8], hint: "8 ÷ (3 - 8 ÷ 3)" },
  { numbers: [4, 4, 4, 4], hint: "4 + 4 + 4 + 4" },
  { numbers: [1, 6, 6, 8], hint: "(6 - 1 - 6 ÷ 8)" },
  { numbers: [5, 5, 5, 1], hint: "5 × (5 - 1 ÷ 5)" },
  { numbers: [2, 4, 6, 8], hint: "2 × 4 + 6 + 8" },
  { numbers: [3, 4, 5, 6], hint: "(6 - 3) × (4 + 5 - 1)" },
  { numbers: [2, 2, 4, 8], hint: "2 × 2 × 4 + 8" },
  { numbers: [1, 2, 8, 9], hint: "(9 - 1) × (8 - 2 - 3)" },
  { numbers: [3, 3, 3, 3], hint: "(3 + 3 + 3) × 3 - 3" },
  { numbers: [2, 2, 6, 6], hint: "(2 + 6) × (6 - 2 - 1)" },
  { numbers: [1, 7, 8, 8], hint: "(7 - 1) × 8 ÷ 2" },
  { numbers: [4, 6, 6, 9], hint: "(6 + 6) × (9 - 4 - 3)" },
];

let usedPuzzleIndices = [];

export function generateQuestion() {
  // Reset if all puzzles used
  if (usedPuzzleIndices.length >= VALID_PUZZLES.length) {
    usedPuzzleIndices = [];
  }
  
  // Find an unused puzzle
  let index;
  do {
    index = Math.floor(Math.random() * VALID_PUZZLES.length);
  } while (usedPuzzleIndices.includes(index));
  
  usedPuzzleIndices.push(index);
  
  const puzzle = VALID_PUZZLES[index];
  // Shuffle the numbers for variety
  const shuffled = [...puzzle.numbers].sort(() => Math.random() - 0.5);
  
  return {
    numbers: shuffled,
    hint: puzzle.hint,
    originalNumbers: puzzle.numbers
  };
}

// Safe expression evaluator
export function evaluateExpression(expression, availableNumbers) {
  try {
    // Only allow numbers, operators, parentheses, and spaces
    const sanitized = expression.replace(/\s/g, '');
    if (!/^[\d+\-*/().]+$/.test(sanitized)) {
      return { valid: false, error: 'Invalid characters in expression' };
    }

    // Extract numbers from expression
    const numbersInExpr = sanitized.match(/\d+/g)?.map(Number) || [];
    
    // Check if exactly the right numbers are used
    const sortedAvailable = [...availableNumbers].sort((a, b) => a - b);
    const sortedExpr = [...numbersInExpr].sort((a, b) => a - b);
    
    if (sortedAvailable.length !== sortedExpr.length) {
      return { valid: false, error: 'Must use all 4 numbers exactly once' };
    }
    
    for (let i = 0; i < sortedAvailable.length; i++) {
      if (sortedAvailable[i] !== sortedExpr[i]) {
        return { valid: false, error: 'Must use the given numbers' };
      }
    }

    // Evaluate the expression
    const result = Function('"use strict"; return (' + sanitized + ')')();
    
    if (typeof result !== 'number' || isNaN(result)) {
      return { valid: false, error: 'Invalid expression' };
    }

    // Check if result equals 24 (with floating point tolerance)
    if (Math.abs(result - 24) < 0.0001) {
      return { valid: true, result: 24 };
    } else {
      return { valid: false, result, error: `Result is ${result.toFixed(2)}, not 24` };
    }
  } catch (e) {
    return { valid: false, error: 'Invalid expression syntax' };
  }
}

// Score calculation
export function calculateScore(timeRemaining, streak) {
  const basePoints = 100;
  const timeBonus = Math.floor(timeRemaining * 3);
  const streakBonus = Math.min(streak * 20, 100);
  return basePoints + timeBonus + streakBonus;
}

// High score management
export function getHighScore() {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('game24_highscore') || '0', 10);
  }
  return 0;
}

export function setHighScore(score) {
  if (typeof window !== 'undefined') {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem('game24_highscore', score.toString());
      return true;
    }
  }
  return false;
}

// Snake game initial state
export function getInitialSnake() {
  return [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
}

export function getRandomFruitPosition(snake, gridSize) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}
