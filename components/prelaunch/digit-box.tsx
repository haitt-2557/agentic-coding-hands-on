// mm:186:2619 — digit box: gradient/blur background rectangle (I*;186:2616) layered
// behind the LED glyph (I*;186:2617). Opacity/blur/gradient live on the background layer
// only — applying them to the container would grey the digit and lose the LED look.

interface DigitBoxProps {
  digit: string;
}

export function DigitBox({ digit }: DigitBoxProps) {
  return (
    <span className="relative inline-flex h-[clamp(55.3px,8.127vw,122.88px)] w-[clamp(34.56px,5.079vw,76.8px)] items-center justify-center">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[clamp(5.4px,0.794vw,12px)] border-[0.75px] border-accent opacity-50 backdrop-blur-[24.96px]"
        style={{ background: 'linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)' }}
      />
      <span className="relative font-digital text-[clamp(33.18px,4.876vw,73.728px)] leading-none text-white">
        {digit}
      </span>
    </span>
  );
}
