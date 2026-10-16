import { useLayoutEffect, useRef, useState } from "react";

// Shrinks `text` to fit on one line inside its parent's current width.
// Polls the container's width on an interval rather than relying only on
// ResizeObserver — observer callback delivery can be delayed/suppressed in
// some environments (e.g. a backgrounded tab), which would leave the text
// sized for a width that's no longer current (such as right after a
// sidebar expands/collapses). A plain interval is cheap and always fires.
// Each fit pass also iterates against the text's actual rendered overflow
// rather than a one-shot estimate, so it's correct no matter which font
// (fallback or a still-loading custom font) is active when it runs.
const FitText = ({ text, as: Tag = "div", className = "", minFontSize = 14, maxFontSize = 96 }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const lastWidthRef = useRef(0);
  const [fontSize, setFontSize] = useState(minFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      const containerWidth = container.offsetWidth;
      if (!containerWidth) return;
      lastWidthRef.current = containerWidth;

      let size = maxFontSize;
      textEl.style.fontSize = `${size}px`;

      // Converge on the largest size that still fits, based on the
      // text's actual measured width rather than a one-shot estimate.
      for (let i = 0; i < 4; i++) {
        const textWidth = textEl.scrollWidth;
        if (!textWidth || textWidth <= containerWidth) break;
        size = Math.max(minFontSize, size * (containerWidth / textWidth) * 0.97);
        textEl.style.fontSize = `${size}px`;
      }

      setFontSize(size);
    };

    fit();

    const poll = setInterval(() => {
      if (container.offsetWidth !== lastWidthRef.current) fit();
    }, 150);

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) fit();
    });

    return () => {
      cancelled = true;
      clearInterval(poll);
      observer.disconnect();
    };
  }, [text, minFontSize, maxFontSize]);

  return (
    <div ref={containerRef} className="flex w-full justify-center overflow-hidden">
      <Tag
        ref={textRef}
        className={`inline-block whitespace-nowrap ${className}`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.15 }}
      >
        {text}
      </Tag>
    </div>
  );
};

export default FitText;
