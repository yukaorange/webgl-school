import styles from "@/scss/social.module.scss";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";
import NightModeContext from "@/components/nightModeContext";

export default function Social({ iconSize = "initial" }) {
  const { nightMode } = useContext(NightModeContext);

  return (
    <ul className={styles.list} style={{ "--icon-size": iconSize }}>
      <li
        className={nightMode ? `${styles.item} ${styles.night}` : styles.item}
      >
        <a href="https://twitter.com/webcreaterfrm30" target="blank">
          <FontAwesomeIcon icon={faTwitter} />
          <span className="sr-only">Twitter</span>
        </a>
      </li>
      <li
        className={nightMode ? `${styles.item} ${styles.night}` : styles.item}
      >
        <a href="https://github.com/yukaorange/webgl-school" target="blank">
          <FontAwesomeIcon icon={faGithub} />
          <span className="sr-only">Github</span>
        </a>
      </li>
    </ul>
  );
}
