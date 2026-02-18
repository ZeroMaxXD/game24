'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import GameBoard, { GRID_SIZE } from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import Timer from './components/Timer';
import QuestionPanel from './components/QuestionPanel';
import MobileControls from './components/MobileControls';
import {
  generateQuestion,
  calculateScore,
  getInitialSnake,
  getRandomFruitPosition,
  setHighScore
} from './utils/gameUtils';

const GAME_SPEED = 250; // ms between moves (slower for easier control)
const QUESTION_TIME = 120; // 2 minutes per puzzle

export default function Home() {
  const [gameState, setGameState] = useState('start'); // start, playing, answering, gameover
  const [snake, setSnake] = useState(getInitialSnake());
  const [fruit, setFruit] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME);

  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);

  // Move snake
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      // Update direction
      setDirection(nextDirection);

      switch (nextDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameover');
        setHighScore(score);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameover');
        setHighScore(score);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check fruit collision
      if (head.x === fruit.x && head.y === fruit.y) {
        // Ate fruit - trigger question mode
        setGameState('answering');
        setQuestion(generateQuestion());
        setTimeRemaining(QUESTION_TIME);
        return newSnake; // Don't remove tail - snake grows
      }

      // Remove tail
      newSnake.pop();
      return newSnake;
    });
  }, [nextDirection, fruit, score]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [gameState, moveSnake]);

  // Question timer
  useEffect(() => {
    if (gameState === 'answering') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up!
            setGameState('gameover');
            setHighScore(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState, score]);

  // Handle direction change (for both keyboard and mobile)
  const handleDirectionChange = useCallback((newDirection) => {
    if (gameState !== 'playing') return;

    // Prevent 180-degree turns
    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposites[newDirection] !== direction) {
      setNextDirection(newDirection);
    }
  }, [gameState, direction]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'gameover' && e.key === ' ') {
        restartGame();
        return;
      }

      if (gameState === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        setGameState('playing');
        return;
      }

      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionChange('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleDirectionChange]);

  // Handle correct answer
  const handleCorrectAnswer = () => {
    const points = calculateScore(timeRemaining, streak);
    setScore(prev => prev + points);
    setStreak(prev => prev + 1);
    setFruit(getRandomFruitPosition(snake, GRID_SIZE));
    setGameState('playing');
    setQuestion(null);
  };

  // Handle wrong answer (just feedback, doesn't end game)
  const handleWrongAnswer = () => {
    // Deduct some time for wrong answer
    setTimeRemaining(prev => Math.max(0, prev - 3));
  };

  // Restart game
  const restartGame = () => {
    setSnake(getInitialSnake());
    setFruit({ x: 15, y: 10 });
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setStreak(0);
    setQuestion(null);
    setTimeRemaining(QUESTION_TIME);
    setGameState('playing');
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleNumber}>24</span>
          <span className={styles.titleText}>Snake Math</span>
        </h1>
      </header>

      <div className={styles.gameArea}>
        <div className={styles.leftPanel}>
          <Scoreboard score={score} streak={streak} />

          {(gameState === 'answering') && (
            <Timer
              timeRemaining={timeRemaining}
              maxTime={QUESTION_TIME}
              isActive={gameState === 'answering'}
            />
          )}
        </div>

        <div className={styles.centerArea}>
          <GameBoard
            snake={snake}
            fruit={fruit}
            direction={direction}
            gameState={gameState}
            isPaused={gameState === 'answering'}
          />

          {gameState === 'start' && (
            <div className={styles.overlay}>
              <div className={styles.startScreen}>
                <h2>🐍 24 Fun Math 🧮</h2>
                <p>Eat the fruit to get a math puzzle!</p>
                <p>Make <strong>24</strong> using all 4 numbers</p>
                <p>You have <strong>2 minutes</strong> per puzzle</p>
                <div className={styles.controls}>
                  <span className={styles.desktopHint}>⬆️⬇️⬅️➡️ or WASD to move</span>
                  <span className={styles.mobileHint}>Swipe or use D-pad to move</span>
                </div>
                <button onClick={() => setGameState('playing')} className={styles.startBtn}>
                  Tap to Start! 🎮
                </button>
              </div>
            </div>
          )}

          {/* Mobile Controls - only shown on mobile */}
          <MobileControls
            onDirectionChange={handleDirectionChange}
            disabled={gameState !== 'playing'}
          />
        </div>

        <div className={styles.rightPanel}>
          <QuestionPanel
            question={question}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            isVisible={gameState === 'answering'}
            disabled={gameState !== 'answering'}
          />

          {gameState === 'playing' && (
            <div className={styles.instructions}>
              <p>🍎 Eat the fruit!</p>
              <p className={styles.desktopHint}>Use arrow keys or WASD</p>
              <p className={styles.mobileHint}>Swipe or tap D-pad</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className={styles.gameOverPanel}>
              <h2>Game Over!</h2>
              <p>Final Score: <strong>{score}</strong></p>
              <button onClick={restartGame} className={styles.restartBtn}>
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>🎮 24 Snake Math - Works on mobile!</p>
      </footer>
    </main>
  );
}
