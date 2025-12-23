'use client';

import { useState, useEffect } from 'react';
import styles from './Scoreboard.module.css';
import { getHighScore } from '../utils/gameUtils';

export default function Scoreboard({ score, streak }) {
    const [highScore, setHighScore] = useState(0);
    const [scoreAnim, setScoreAnim] = useState(false);

    useEffect(() => {
        setHighScore(getHighScore());
    }, []);

    useEffect(() => {
        if (score > 0) {
            setScoreAnim(true);
            const timer = setTimeout(() => setScoreAnim(false), 300);
            return () => clearTimeout(timer);
        }
    }, [score]);

    useEffect(() => {
        const hs = getHighScore();
        if (hs !== highScore) {
            setHighScore(hs);
        }
    }, [score]);

    return (
        <div className={styles.scoreboard}>
            <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>🏆 SCORE</span>
                <span className={`${styles.scoreValue} ${scoreAnim ? styles.scoreAnim : ''}`}>
                    {score.toLocaleString()}
                </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>🔥 STREAK</span>
                <span className={styles.streakValue}>
                    {streak}x
                </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>⭐ BEST</span>
                <span className={styles.highScoreValue}>
                    {highScore.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
