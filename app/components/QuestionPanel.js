'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './QuestionPanel.module.css';
import { evaluateExpression } from '../utils/gameUtils';

export default function QuestionPanel({
    question,
    onCorrectAnswer,
    onWrongAnswer,
    isVisible,
    disabled
}) {
    const [expression, setExpression] = useState('');
    const [usedNumbers, setUsedNumbers] = useState([]); // Track which indices are used
    const [feedback, setFeedback] = useState(null);
    const [shake, setShake] = useState(false);
    const inputRef = useRef(null);

    // Reset when new question appears
    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
        setExpression('');
        setUsedNumbers([]);
        setFeedback(null);
    }, [question, isVisible]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!expression.trim() || disabled) return;

        const result = evaluateExpression(expression, question.numbers);

        if (result.valid) {
            setFeedback({ type: 'success', message: '✓ Correct! +Points' });
            setTimeout(() => {
                onCorrectAnswer();
                setExpression('');
                setUsedNumbers([]);
                setFeedback(null);
            }, 500);
        } else {
            setFeedback({ type: 'error', message: result.error });
            setShake(true);
            setTimeout(() => setShake(false), 500);
            onWrongAnswer();
        }
    };

    const handleNumberClick = (num, index) => {
        if (usedNumbers.includes(index)) return; // Already used

        setExpression(prev => prev + num);
        setUsedNumbers(prev => [...prev, index]);
        inputRef.current?.focus();
    };

    const handleOperatorClick = (op) => {
        setExpression(prev => prev + op);
        inputRef.current?.focus();
    };

    const handleBackspace = () => {
        if (expression.length === 0) return;

        const lastChar = expression.slice(-1);
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);

        // If last char was a number, re-enable it
        if (/\d/.test(lastChar)) {
            const num = parseInt(lastChar);
            // Find the last used index for this number and remove it
            const lastUsedIndex = [...usedNumbers].reverse().find(idx => question.numbers[idx] === num);
            if (lastUsedIndex !== undefined) {
                setUsedNumbers(prev => prev.filter((idx, i) => i !== prev.lastIndexOf(lastUsedIndex)));
            }
        }

        inputRef.current?.focus();
    };

    const handleClear = () => {
        setExpression('');
        setUsedNumbers([]);
        inputRef.current?.focus();
    };

    if (!isVisible || !question) return null;

    return (
        <div className={`${styles.panel} ${shake ? styles.shake : ''}`}>
            <div className={styles.header}>
                <h2 className={styles.title}>🧮 Make 24!</h2>
                <p className={styles.subtitle}>Tap each number once to use it</p>
            </div>

            {/* Number buttons - disabled after use */}
            <div className={styles.numbersGrid}>
                {question.numbers.map((num, i) => {
                    const isUsed = usedNumbers.includes(i);
                    return (
                        <button
                            key={i}
                            className={`${styles.numberBtn} ${isUsed ? styles.numberUsed : ''}`}
                            onClick={() => handleNumberClick(num, i)}
                            disabled={disabled || isUsed}
                            type="button"
                        >
                            {num}
                            {isUsed && <span className={styles.checkMark}>✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Expression display */}
            <div className={styles.expressionDisplay}>
                <input
                    ref={inputRef}
                    type="text"
                    value={expression}
                    onChange={(e) => {
                        // Don't allow direct typing of numbers - only use buttons
                        const newVal = e.target.value;
                        const lastChar = newVal.slice(-1);
                        if (/\d/.test(lastChar) && newVal.length > expression.length) {
                            return; // Block typing numbers directly
                        }
                        setExpression(newVal);
                    }}
                    placeholder="Build your expression..."
                    className={styles.input}
                    disabled={disabled}
                    autoComplete="off"
                />
            </div>

            {/* Usage indicator */}
            <div className={styles.usageIndicator}>
                Numbers used: {usedNumbers.length}/4
                {usedNumbers.length === 4 && <span className={styles.allUsed}> ✓ All used!</span>}
            </div>

            {/* Operators - Large buttons */}
            <div className={styles.operatorsGrid}>
                <button type="button" className={`${styles.opBtn} ${styles.opAdd}`} onClick={() => handleOperatorClick('+')} disabled={disabled}>+</button>
                <button type="button" className={`${styles.opBtn} ${styles.opSub}`} onClick={() => handleOperatorClick('-')} disabled={disabled}>−</button>
                <button type="button" className={`${styles.opBtn} ${styles.opMul}`} onClick={() => handleOperatorClick('*')} disabled={disabled}>×</button>
                <button type="button" className={`${styles.opBtn} ${styles.opDiv}`} onClick={() => handleOperatorClick('/')} disabled={disabled}>÷</button>
                <button type="button" className={`${styles.opBtn} ${styles.opParen}`} onClick={() => handleOperatorClick('(')} disabled={disabled}>(</button>
                <button type="button" className={`${styles.opBtn} ${styles.opParen}`} onClick={() => handleOperatorClick(')')} disabled={disabled}>)</button>
            </div>

            {/* Action buttons */}
            <div className={styles.actionRow}>
                <button type="button" className={styles.clearBtn} onClick={handleClear} disabled={disabled}>
                    Clear All
                </button>
                <button type="button" className={styles.backBtn} onClick={handleBackspace} disabled={disabled}>
                    ← Undo
                </button>
                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={disabled || !expression.trim()}
                >
                    ✓ Check
                </button>
            </div>

            {feedback && (
                <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                    {feedback.message}
                </div>
            )}

            <div className={styles.hint}>
                💡 Each number can only be used once!
            </div>
        </div>
    );
}
