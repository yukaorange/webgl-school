import Meta from "@/components/meta";
import WebglSection1 from "@/components/webglSchoolSection1";

export default function Home() {
  const images = ["square.jpg"];
  return (
    <>
      <Meta />
      <WebglSection1 images={images} />
    </>
  );
}
