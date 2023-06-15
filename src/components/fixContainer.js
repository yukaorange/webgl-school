import styles from "@/scss/fixContainer.module.scss";

export default function FixContainer({ children }) {
  return(
    <>
      <div className={styles.fixed}>{children}</div>
    </>
  );
}
