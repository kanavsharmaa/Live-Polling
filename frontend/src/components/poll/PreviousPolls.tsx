import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import styles from './PollResults.module.css';
import { useParams } from 'react-router-dom';

interface Poll {
  _id: string;
  question: string;
  options: { text: string; votes: number }[];
  createdAt: string;
}

const PreviousPolls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { roomId } = useParams<{ roomId: string }>(); 

  useEffect(() => {
    if (roomId) {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/polls/${roomId}`;
      axios.get(apiUrl)
        .then((response: AxiosResponse<Poll[]>) => {
          setPolls(response.data);
          setLoading(false);
        })
        .catch((error: AxiosError) => {
          console.error('Error fetching previous polls:', error);
          setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [roomId]);

  if (loading) {
    return <p>Loading previous polls...</p>;
  }

  if (polls.length === 0) {
    return <p>No previous polls found.</p>;
  }

  return (
    <div className={styles.previousPollsContainer}>
      <h2>Previous Polls</h2>
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        return (
            <div key={poll._id} className={styles.pollResults}>
                <div className={styles.questionHeader}>
                    {poll.question}
                </div>
                <div className={styles.optionsList}>
                    {poll.options.map((option, index) => {
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
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
      })}
    </div>
  );
};

export default PreviousPolls; 