import styles from "@/scss/fixContainer.module.scss";

export default function FixContainer({ children }) {
  rerurn(
    <>
      <div className={styles.fixed}>{children}</div>
    </>
  );
}
