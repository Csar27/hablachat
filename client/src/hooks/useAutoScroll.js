import { useEffect, useRef, useCallback, useState } from 'react';

export function useAutoScroll(dependencias) {
  const containerRef = useRef(null);
  const estaEnBottomRef = useRef(true);
  const [lejosDelFinal, setLejosDelFinal] = useState(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distancia = scrollHeight - scrollTop - clientHeight;
    const abajo = distancia < 80;
    estaEnBottomRef.current = abajo;
    setLejosDelFinal(!abajo);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (estaEnBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, dependencias);

  const scrollAlFinal = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, []);

  return { containerRef, handleScroll, scrollAlFinal, lejosDelFinal };
}
