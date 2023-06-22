import { useContext, useState } from "react";
import { NightModeContext } from "@/components/nightModeContext";
import BackButton from "@/components/backButton";
import Container from "@/components/container";
import ButtonBox from "@/components/buttonBox";
import Meta from "@/components/meta";
import { useEffect, useRef } from "react";
import { Sketch } from "@/js/webglSection03";
import styles from "@/scss/section03.module.scss";
import pageOGP from "images/section03.jpg";

export default function Section03() {
  const images = ["/earthmap.jpg"];
  const containerRef = useRef();
  const { nightMode, setNightMode } = useContext(NightModeContext);

  useEffect(() => {
    const sketch = new Sketch({ dom: containerRef.current });
    setNightMode(true);
    return () => {
      setNightMode(false);
    };
  }, []);

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
      <div className={styles.background}></div>
    </>
  );
}
