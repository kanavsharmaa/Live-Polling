import styles from "./RoomID.module.css";

function RoomID({ roomId }: { roomId: string | undefined }) {
  return <div className={styles.roomID}>Your Room ID is: {roomId}</div>;
}

export default RoomID;
