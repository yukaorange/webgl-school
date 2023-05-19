import Meta from "@/components/meta";
import WebglSection1 from "@/components/WebglSchoolSection1";

export default function Home() {
  const images = ["image2.jpg", "image2.jpg","image1.jpg"];
  return (
    <>
      <Meta />
      <WebglSection1 images={images} />
    </>
  );
}
