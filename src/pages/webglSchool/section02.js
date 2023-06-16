import { useContext, useState } from "react";
import { NightModeContext } from "@/components/nightModeContext";
import BackButton from "@/components/backButton";
import Container from "@/components/container";
import ButtonBox from "@/components/buttonBox";
import Meta from "@/components/meta";
import { useEffect, useRef } from "react";
import { Sketch } from "@/js/webglSection02";
import styles from "@/scss/section02.module.scss";
import pageOGP from "images/section02.jpg";

export default function Section02() {
  const images = ["/white-texture.jpg"];
  const containerRef = useRef();
  const [activeBG, setActiveBG] = useState(2);
  const [beforeBG, setBeforeBG] = useState(1);

  const { nightMode, setNightMode } = useContext(NightModeContext);

  useEffect(() => {
    const sketch = new Sketch({ dom: containerRef.current });
    setNightMode(true);
    return () => {
      setNightMode(false);
    };
  }, [nightMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeforeBG(activeBG);
      setActiveBG(activeBG === 3 ? 1 : activeBG + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBG]);

  return (
    <>
      <Meta
        pageImg={pageOGP.src}
        pageImgW={pageOGP.width}
        pageImgH={pageOGP.height}
      />
      {/* webGL */}
      <div id="container" ref={containerRef} className={styles.container}>
        <div id="slider" data-images={images}></div>
      </div>
      {/* 戻るボタンを設置 */}
      <Container section={true}>
        <ButtonBox>
          <BackButton nightMode={nightMode} />
        </ButtonBox>
      </Container>
      {/* 背景 */}
      <div className={styles.backgrounds}>
        <div
          className={`${styles.background01} ${
            activeBG == 1 ? styles.active : beforeBG == 1 ? styles.before : ""
          }`}
        ></div>
        <div
          className={`${styles.background02} ${
            activeBG == 2 ? styles.active : beforeBG == 2 ? styles.before : ""
          }`}
        ></div>
        <div
          className={`${styles.background03} ${
            activeBG == 3 ? styles.active : beforeBG == 3 ? styles.before : ""
          }`}
        ></div>
      </div>
    </>
  );
}
