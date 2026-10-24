// Shows a template screenshot inside a laptop frame with a phone frame
// overlapping its front-right corner, like the original composite mockups
// (biznestProductWhite.png / boutiqueProductTransparent.png) — both devices
// visible at once, no toggle needed.
// MacBook-style, viewed straight-on (like the reference mockups): a black bezel with a
// small camera dot, a thin hinge line, then a smooth rounded light-silver edge — just the
// closed lid's front edge, not a top-down keyboard, so no trackpad/key detail here — and a
// soft ambient shadow underneath so it reads as resting on a surface.
const LaptopFrame = ({ src, alt }) => (
  <div className="mx-auto w-full">
    <div className="relative rounded-t-2xl border-[14px] border-b-0 border-gray-900 bg-gray-900">
      {/* <div className="absolute left-1/2 top-[6px] h-1 w-1 -translate-x-1/2 rounded-full bg-gray-600" /> */}
      <div className="aspect-[16/10] overflow-hidden rounded-t-md bg-white">
        <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
      </div>
    </div>
    <div className="h-[3px] bg-gradient-to-b from-gray-800 to-gray-300" />
    <div className="relative mx-[-10%] h-4 rounded-b-2xl bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300">
      <div className="absolute left-1/2 top-0 h-1.5 w-12 -translate-x-1/2 rounded-b-md bg-gray-400/50" />
    </div>
    <div className="mx-[8%] mt-2 h-3 rounded-[50%] bg-gray-400/30 blur-md" aria-hidden="true" />
  </div>
);

const PhoneFrame = ({ src, alt }) => (
  <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[1.4rem] border-[6px] border-gray-900 bg-gray-900 shadow-2xl">
    <div className="absolute left-1/2 top-0 z-10 h-3.5 w-14 -translate-x-1/2 rounded-b-lg bg-gray-900" />
    <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
  </div>
);

const DeviceMockup = ({ laptopSrc, mobileSrc, alt }) => (
  <div className="relative mx-auto w-full" style={{ paddingRight: "12%" }}>
    <LaptopFrame src={laptopSrc} alt={alt} />
    <div className="absolute bottom-[8%] right-0 w-[23%]">
      <PhoneFrame src={mobileSrc} alt={alt} />
    </div>
  </div>
);

export default DeviceMockup;
