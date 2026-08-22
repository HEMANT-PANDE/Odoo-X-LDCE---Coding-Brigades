import { useState } from 'react';

/**
 * AccordionGallery
 * A row of panels that expand on hover/focus/click, collapsing the rest —
 * like fanning out a stack of postcards.
 *
 * items: [{ id, title, subtitle, image, tag }]
 */
export function AccordionGallery({ items = [], defaultActive = 0, className = '' }) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div
      className={`flex h-[420px] w-full gap-2 overflow-hidden rounded-2xl ${className}`}
      role="list"
    >x
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <button
            key={item.id ?? i}
            role="listitem"
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`group relative h-full overflow-hidden rounded-2xl outline-none ring-offset-2 transition-[flex-grow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#F2A93B] ${
              isActive ? 'flex-[6]' : 'flex-[1]'
            }`}
            style={{ minWidth: isActive ? undefined : '64px' }}
            aria-expanded={isActive}
            aria-label={item.title}
          >
            <img
              src={item.image}
              alt={item.title}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                isActive ? 'scale-100 saturate-100' : 'scale-110 saturate-[0.35] brightness-[0.75]'
              }`}
              draggable={false}
            />

            <div
              className={`absolute inset-0 bg-gradient-to-t from-[#16302B]/85 via-[#16302B]/10 to-transparent transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-70'
              }`}
            />

            {item.tag && (
              <span
                className={`absolute right-3 top-3 rounded-full bg-[#FBF6ED]/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#16302B] transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {item.tag}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-3 text-left">
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.2em] text-[#F2A93B] transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {item.subtitle}
              </p>
              <p
                className={`origin-bottom-left whitespace-nowrap font-serif text-[#FBF6ED] transition-all duration-500 ${
                  isActive ? 'rotate-0 text-2xl' : 'rotate-90 translate-y-[-1.6rem] text-lg opacity-90'
                }`}
                style={!isActive ? { writingMode: 'vertical-rl' } : undefined}
              >
                {item.title}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AccordionGallery;
