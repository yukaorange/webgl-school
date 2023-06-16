import Social from "@/components/social";
import styles from "@/scss/header.module.scss";
import Link from "next/link";
import { useContext } from "react";
import { NightModeContext } from "@/components/nightModeContext";

export default function Header() {
  const { nightMode } = useContext(NightModeContext);
  
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div
          className={
            nightMode ? `${styles.heading} ${styles.night}` : styles.heading
          }
        >
          <Link href="/">
            <h2>takaoka web.</h2>
          </Link>
        </div>
        <Social />
      </div>
    </header>
  );
}
