import Meta from "@/components/meta";
import Link from "next/link";
import Container from "@/components/container";
import Image from "next/image";
import styles from "@/scss/home.module.scss";
import LinkCard from "@/components/linkCard";

export default function Home() {
  const subpages = [
    { page: "section01", title: "cube", thumbnail: "square.jpg" },
    { page: "section02", title: "windmil", thumbnail: "nathan-night.webp" },
    { page: "section03", title: "earth", thumbnail: "earth-thumb.webp" },
  ];
  return (
    <>
      <Meta />
      <Container section={true}>
        <section>
          <h2 className={styles.header}>
            <span className={styles.header__text}>webGL School</span>
          </h2>
          <div className={styles.body}>
            <div className={styles.grid}>
              {subpages.map(({ page, title, thumbnail }) => (
                <LinkCard
                  key={page}
                  page={page}
                  title={title}
                  thumbnail={thumbnail}
                />
              ))}
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
