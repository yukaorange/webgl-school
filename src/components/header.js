import Social from "@/components/social";
import styles from "@/scss/header.module.scss";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <Link href="/">
            <h2>takaoka web.</h2>
          </Link>
        </div>
        <Social />
      </div>
    </header>
  );
}
