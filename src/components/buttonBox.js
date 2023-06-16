import styles from "@/scss/buttonBox.module.scss";
export default function ButtonBox({ children }) {
  return (
    <>
      <div className={styles.buttonBox}>{children}</div>
    </>
  );
}
