import Social from "@/components/social";
import styles from "@/scss/Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2>takaoka web.</h2>
        </div>
        <Social />
      </div>
    </header>
  );
}
