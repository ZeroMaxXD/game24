'use client';

import { useRef, useEffect } from 'react';
import styles from './MobileControls.module.css';

export default function MobileControls({ onDirectionChange, disabled }) {
    const touchStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Handle swipe gestures on the whole screen
    useEffect(() => {
        const handleTouchStart = (e) => {
            if (disabled) return;
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        };

        const handleTouchEnd = (e) => {
            if (disabled) return;
            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const diffX = touchEnd.x - touchStartRef.current.x;
            const diffY = touchEnd.y - touchStartRef.current.y;
            const minSwipe = 30; // Minimum swipe distance

            // Determine swipe direction
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > minSwipe) {
                    onDirectionChange(diffX > 0 ? 'RIGHT' : 'LEFT');
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > minSwipe) {
                    onDirectionChange(diffY > 0 ? 'DOWN' : 'UP');
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onDirectionChange, disabled]);

    const handleButtonPress = (direction) => {
        if (disabled) return;
        onDirectionChange(direction);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <p className={styles.hint}>Swipe or use buttons to move 🐍</p>
            <div className={styles.dpad}>
                <div className={styles.row}>
                    <button
                        className={styles.btn}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('UP'); }}
                        onClick={() => handleButtonPress('UP')}
                        disabled={disabled}
                    >
                        ▲
                    </button>
                </div>
                <div className={styles.row}>
                    <button
                        className={styles.btn}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('LEFT'); }}
                        onClick={() => handleButtonPress('LEFT')}
                        disabled={disabled}
                    >
                        ◀
                    </button>
                    <div className={styles.center}>🐍</div>
                    <button
                        className={styles.btn}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('RIGHT'); }}
                        onClick={() => handleButtonPress('RIGHT')}
                        disabled={disabled}
                    >
                        ▶
                    </button>
                </div>
                <div className={styles.row}>
                    <button
                        className={styles.btn}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('DOWN'); }}
                        onClick={() => handleButtonPress('DOWN')}
                        disabled={disabled}
                    >
                        ▼
                    </button>
                </div>
            </div>
        </div>
    );
}
