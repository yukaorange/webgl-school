import styles from "@/scss/backButton.module.scss";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function BackButton({ nightMode }) {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };

  return (
    <button
      className={nightMode ? `${styles.button} ${styles.night}` : styles.button}
      onClick={handleClick}
    >
      back
    </button>
  );
}
