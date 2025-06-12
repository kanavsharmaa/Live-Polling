import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { socket } from '../../socket';
import Button from '../ui/Button/Button';
import styles from './ParticipantsList.module.css';

const ParticipantsList: React.FC<{ roomId: string | undefined }> = ({ roomId }) => {
    const { participants } = useSelector((state: RootState) => state.poll);

    const handleKickStudent = (studentId: string) => {
        socket.emit('kick-student', { studentId, roomId });
    };

    const studentParticipants = Object.entries(participants).filter(([, p]) => p.name !== 'Teacher');

    return (
        <div className={styles.participantsSidebar}>
            <h2 className="heading2">Participants ({studentParticipants.length})</h2>
            <ul>
                {studentParticipants.map(([id, participant]) => (
                    <li key={id}>
                        <span>{participant.name} {participant.answered ? '✓' : ''}</span>
                        <Button variant="danger" onClick={() => handleKickStudent(id)}>Kick</Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ParticipantsList; 