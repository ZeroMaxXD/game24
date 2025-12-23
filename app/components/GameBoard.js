'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './GameBoard.module.css';

const GRID_SIZE = 20;

export default function GameBoard({
    snake,
    fruit,
    direction,
    gameState,
    onMove,
    isPaused
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(25);

    // Responsive canvas sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const maxWidth = Math.min(containerWidth - 20, 500); // Max 500px
                const newCellSize = Math.floor(maxWidth / GRID_SIZE);
                setCellSize(Math.max(15, Math.min(25, newCellSize))); // Between 15-25px
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Draw game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = GRID_SIZE * cellSize;
        const height = GRID_SIZE * cellSize;

        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(width, i * cellSize);
            ctx.stroke();
        }

        // Draw fruit with glow
        if (fruit) {
            const fx = fruit.x * cellSize + cellSize / 2;
            const fy = fruit.y * cellSize + cellSize / 2;

            // Glow effect
            const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, cellSize);
            gradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.4)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(fruit.x * cellSize - cellSize / 2, fruit.y * cellSize - cellSize / 2, cellSize * 2, cellSize * 2);

            // Fruit emoji
            ctx.font = `${cellSize - 4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍎', fx, fy);
        }

        // Draw snake
        snake.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            if (index === 0) {
                // Head with gradient
                const headGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                headGradient.addColorStop(0, '#00ff88');
                headGradient.addColorStop(1, '#00cc66');
                ctx.fillStyle = headGradient;
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 15;
            } else {
                // Body segments
                const opacity = 1 - (index / snake.length) * 0.5;
                ctx.fillStyle = `rgba(0, 200, 100, ${opacity})`;
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw eyes on head
        if (snake.length > 0) {
            const head = snake[0];
            const hx = head.x * cellSize + cellSize / 2;
            const hy = head.y * cellSize + cellSize / 2;

            ctx.fillStyle = '#000';
            const eyeOffset = cellSize * 0.15;
            const eyeSize = cellSize * 0.12;
            let eye1x, eye1y, eye2x, eye2y;

            switch (direction) {
                case 'UP':
                    eye1x = hx - eyeOffset; eye1y = hy - eyeOffset;
                    eye2x = hx + eyeOffset; eye2y = hy - eyeOffset;
                    break;
                case 'DOWN':
                    eye1x = hx - eyeOffset; eye1y = hy + eyeOffset;
                    eye2x = hx + eyeOffset; eye2y = hy + eyeOffset;
                    break;
                case 'LEFT':
                    eye1x = hx - eyeOffset; eye1y = hy - eyeOffset;
                    eye2x = hx - eyeOffset; eye2y = hy + eyeOffset;
                    break;
                case 'RIGHT':
                default:
                    eye1x = hx + eyeOffset; eye1y = hy - eyeOffset;
                    eye2x = hx + eyeOffset; eye2y = hy + eyeOffset;
            }

            ctx.beginPath();
            ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2);
            ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Game over overlay
        if (gameState === 'gameover') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ff4444';
            ctx.font = `bold ${cellSize * 1.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME OVER', width / 2, height / 2 - 20);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = `${cellSize * 0.7}px Arial`;
            ctx.fillText('Tap to restart', width / 2, height / 2 + 20);
        }

        // Paused overlay
        if (isPaused && gameState === 'playing') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#fff';
            ctx.font = `bold ${cellSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SOLVING...', width / 2, height / 2);
        }

    }, [snake, fruit, direction, gameState, isPaused, cellSize]);

    return (
        <div className={styles.boardContainer} ref={containerRef}>
            <canvas
                ref={canvasRef}
                width={GRID_SIZE * cellSize}
                height={GRID_SIZE * cellSize}
                className={styles.canvas}
            />
            <div className={styles.borderGlow} />
        </div>
    );
}

export { GRID_SIZE };
