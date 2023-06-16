import styles from "@/scss/backButton.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function BackButton({nightMode}) {
  return <button className={nightMode ? `${styles.button} ${styles.night}` : styles.button} onClick={() => window.history.back()}>back</button>;
}
