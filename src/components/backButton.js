import styles from "@/scss/backButton.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function BackButton() {
  return <button className={styles.button} onClick={() => window.history.back()}>back</button>;
}
