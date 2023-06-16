import "@fortawesome/fontawesome-svg-core/styles.css";
import { NightModeProvider } from "@/components/nightModeContext";
import { config } from "@fortawesome/fontawesome-svg-core";
import Layout from "@/components/layout";
import styles from "@/scss/style.scss";

config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp({ Component, pageProps }) {
  return (
    <NightModeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NightModeProvider>
  );
}

export default MyApp;
