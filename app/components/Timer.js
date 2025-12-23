'use client';

import { useState, useEffect } from 'react';
import styles from './Timer.module.css';

export default function Timer({ timeRemaining, maxTime, isActive }) {
    const percentage = (timeRemaining / maxTime) * 100;

    const getColorClass = () => {
        if (percentage > 60) return styles.timerGreen;
        if (percentage > 30) return styles.timerYellow;
        return styles.timerRed;
    };

    // Format time as M:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.timerContainer}>
            <div className={styles.timerLabel}>
                <span className={styles.timerIcon}>⏱️</span>
                <span>TIME REMAINING</span>
            </div>
            <div className={styles.timerBarOuter}>
                <div
                    className={`${styles.timerBarInner} ${getColorClass()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className={`${styles.timerValue} ${getColorClass()}`}>
                {formatTime(timeRemaining)}
            </div>
            {timeRemaining <= 30 && isActive && (
                <div className={styles.urgentPulse} />
            )}
        </div>
    );
}
