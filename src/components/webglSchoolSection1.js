import { useEffect, useRef } from 'react';
import { Sketch } from '@/js/webglSchoolSection1';
import styles from '@/scss/webglSection1.module.scss';

export default function WebglSection1({images}) {
  const containerRef = useRef();

  useEffect(() => {
    // Sketchクラスのインスタンスを作成
    const sketch = new Sketch({ dom: containerRef.current});
  }, []);

  return (
    <div id="container" ref={containerRef} className={styles.container}>
      <div id="slider" data-images={images}></div>
    </div>
  );
}
