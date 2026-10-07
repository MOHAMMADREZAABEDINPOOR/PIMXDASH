import { useRef, useCallback, useEffect } from 'react';

interface TiltOptions {
  maxRotation?: number; // degrees, default 10
  perspective?: number; // px, default 1000
  disabled?: boolean;
}

export function use3DTilt(options: TiltOptions = {}) {
  const { maxRotation = 10, disabled = false } = options;
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized between -1 and 1
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      // Rotation angles: moving mouse right tilts card Y positive, moving down tilts card X negative
      const rotY = (normX * maxRotation).toFixed(2);
      const rotX = (-normY * maxRotation).toFixed(2);

      ref.current.style.setProperty('--card-rx', `${rotX}deg`);
      ref.current.style.setProperty('--card-ry', `${rotY}deg`);
    },
    [maxRotation, disabled]
  );

  const handlePointerLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--card-rx', '0deg');
    ref.current.style.setProperty('--card-ry', '0deg');
  }, []);

  useEffect(() => {
    return () => {
      if (ref.current) {
        ref.current.style.removeProperty('--card-rx');
        ref.current.style.removeProperty('--card-ry');
      }
    };
  }, []);

  return {
    ref,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  };
}
