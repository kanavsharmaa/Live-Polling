import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import styles from './PollResults.module.css';

const PollResults: React.FC = () => {
    const { question, results, options } = useSelector((state: RootState) => state.poll);
    const totalVotes = results ? Object.values(results).reduce((sum, count) => sum + count, 0) : 0;

    return (
        <div className={styles.pollResults}>
            <div className={styles.questionHeader}>
                {question}
            </div>
            <div className={styles.optionsList}>
                {options.map((option, index) => {
                    const count = results ? results[option.text] : 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                        <div key={option.text} className={styles.option}>
                            <div className={styles.optionLeft}>
                                <div className={styles.optionNumber}>{index + 1}</div>
                                <div className={styles.optionText}>{option.text}</div>
                            </div>
                            <div className={styles.optionRight}>
                                <div className={styles.progressBar} style={{ width: `${percentage}%` }} />
                                <span className={styles.percentage}>{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollResults; 