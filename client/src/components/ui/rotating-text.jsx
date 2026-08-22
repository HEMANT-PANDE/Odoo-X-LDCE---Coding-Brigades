import { useEffect, useMemo, useState } from 'react';

/**
 * RotatingText
 * Split-flap "departure board" style rotating text.
 * Cycles through `texts`, animating each character in with a stagger,
 * like the flip boards at old train/airport terminals.
 *
 * Usage:
 * <RotatingText
 *   texts={['Kyoto', 'Lisbon', 'Marrakech', 'Reykjavik']}
 *   rotationInterval={2200}
 *   staggerDuration={0.035}
 *   mainClassName="text-accent"
 * />
 */
export function RotatingText({
  texts = [],
  rotationInterval = 2200,
  staggerDuration = 0.035,
  splitBy = 'characters',
  loop = true,
  auto = true,
  mainClassName = '',
  elementLevelClassName = '',
  onNext,
}) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0); // bumps to retrigger CSS animation on same word too

  const current = texts[index] ?? '';

  const units = useMemo(() => {
    if (splitBy === 'words') return current.split(' ');
    return current.split('');
  }, [current, splitBy]);

  useEffect(() => {
    if (!auto || texts.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = loop ? (prev + 1) % texts.length : Math.min(prev + 1, texts.length - 1);
        onNext?.(next);
        return next;
      });
      setTick((t) => t + 1);
    }, rotationInterval);
    return () => clearInterval(id);
  }, [auto, loop, rotationInterval, texts.length, onNext]);

  return (
    <span
      className={`relative inline-flex flex-wrap ${mainClassName}`}
      style={{ perspective: '600px' }}
    >
      <span className="sr-only">{current}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap" key={`${index}-${tick}`}>
        {units.map((unit, i) => (
          <span
            key={i}
            className={`inline-block will-change-transform ${elementLevelClassName}`}
            style={{
              animation: `flip-in-char 0.5s cubic-bezier(0.22,1,0.36,1) both`,
              animationDelay: `${i * staggerDuration}s`,
              transformOrigin: '50% 100%',
              whiteSpace: unit === ' ' ? 'pre' : 'normal',
            }}
          >
            {unit === ' ' ? '\u00A0' : unit}
          </span>
        ))}
      </span>

      <style>{`
        @keyframes flip-in-char {
          0% {
            opacity: 0;
            transform: rotateX(65deg) translateY(-35%);
            filter: blur(1px);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0%);
            filter: blur(0px);
          }
        }
      `}</style>
    </span>
  );
}

export default RotatingText;
