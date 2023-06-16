import BackButton from "@/components/backButton";
import Container from "@/components/container";
import Meta from "@/components/meta";
import { useEffect, useRef } from "react";
import { Sketch } from "@/js/webglSection01";

import ButtonBox from "@/components/buttonBox";
import styles from "@/scss/section01.module.scss";
import cube from "images/section01.jpg";

export default function Section01() {
  const images = ["/square.jpg"];
  const containerRef = useRef();

  useEffect(() => {
    const sketch = new Sketch({ dom: containerRef.current });
  }, []);
  return (
    <>
      <Meta pageImg={cube.src} pageImgW={cube.width} pageImgH={cube.height} />
      {/* webGL */}
      <div id="container" ref={containerRef} className={styles.container}>
        <div id="slider" data-images={images}></div>
      </div>
      {/* 戻るボタンを設置 */}
      <Container section={true}>
        <ButtonBox>
          <BackButton />
        </ButtonBox>
      </Container>
    </>
  );
}
