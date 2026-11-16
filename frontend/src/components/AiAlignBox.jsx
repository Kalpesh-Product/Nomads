// components/AiAlignBox.jsx
import AiContainer from "./AiContainer";

// Mirrors the AiHostHeader's width structure (px-1 md:px-20 outer gutter ->
// AiContainer) so page sections' left and right edges line up exactly with
// the "WONO" logo and the header's right-hand nav at every breakpoint —
// phone, tablet, laptop and 4K. Intended to be used inside a full-bleed
// page wrapper (one that cancels AiHostLayout's px-1/md:px-6/lg:px-10/
// xl:px-24 with matching negative margins).
const AiAlignBox = ({ children, className = "" }) => (
  <div className={`px-1 md:px-20 ${className}`}>
    <AiContainer padding={false}>{children}</AiContainer>
  </div>
);

export default AiAlignBox;
