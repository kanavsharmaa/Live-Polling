import styles from './Tag.module.css';

interface TagProps {
    name: string;
}

function Tag({ name }: TagProps) {
  return (
    <div className={styles.tag}>{name}</div>
  )
}

export default Tag