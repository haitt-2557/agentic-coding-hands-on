import Image from 'next/image';
import { PrelaunchCountdown } from '@/components/prelaunch/prelaunch-countdown';

// mm:2268:35127 — Countdown / Prelaunch page. Full-viewport, non-scrolling: this
// screen IS the whole viewport, no header/footer/nav (see clarifications.md).
export default function PrelaunchPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* mm:2268:35129 — MM_MEDIA_BG Image, cover, no-repeat */}
      <Image src="/saa/Prelaunch_BG.png" alt="" fill priority className="object-cover" />
      {/* mm:2268:35130 — Cover gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)',
        }}
      />
      <div className="relative flex h-full w-full items-center justify-center px-6">
        <PrelaunchCountdown />
      </div>
    </main>
  );
}
