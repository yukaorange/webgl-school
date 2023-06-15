import styles from "@/scss/container.module.scss";

export default function Container({ section, children }) {

  const className = section ? `${styles.section} ${styles.container}` : styles.container;

  if (section) {

  }
  return (
    <>
      <div className={className}>{children}</div>
    </>
  );
}
