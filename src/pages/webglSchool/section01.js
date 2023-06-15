import BackButton from "@/components/backButton";
import Container from "@/components/container";
import Meta from "@/components/meta";
import WebglSection1 from "@/components/webglSchoolSection1";
import styles from "@/scss/section01.module.scss";
import cube from "images/section01.jpg";

export default function Section01() {
  const images = ["/square.jpg"];
  return (
    <>
      <Meta pageImg={cube.src} pageImgW={cube.width} pageImgH={cube.height} />
      <WebglSection1 images={images} />
      <Container section={true}>
        <div className={styles.box}>
          <BackButton />
        </div>
      </Container>
    </>
  );
}
