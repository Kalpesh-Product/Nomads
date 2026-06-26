import React, { useState } from "react";

const LinedHeading = ({ title }) => (
  <div className="flex items-center gap-4">
    <div className="flex-1 border-t border-[#111827]" />
    <h2 className="shrink-0 text-center text-[20px] font-semibold uppercase tracking-[0.15em] text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[26px]">
      {title}
    </h2>
    <div className="flex-1 border-t border-[#111827]" />
  </div>
);

const FaqAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || !faqs.length) return null;

  return (
    <section className="bg-[#efefef] px-4 pb-10 pt-0 md:px-6 md:pb-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <LinedHeading title="Frequently Asked Questions" />
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="flex w-full items-center justify-between border-b border-transparent px-5 py-4 text-left transition hover:bg-slate-50 data-[open=true]:border-slate-200"
                data-open={openIndex === idx ? "true" : "false"}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[12px] font-bold text-white font-['Poppins',ui-sans-serif,system-ui,sans-serif]">
                    {idx + 1}
                  </span>
                  <span className="text-[14px] font-semibold text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[15px]">
                    {faq.question}
                  </span>
                </span>
                <span
                  className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[18px] text-slate-500 transition-transform duration-200 ${
                    openIndex === idx ? "border-slate-400" : ""
                  }`}
                >
                  {openIndex === idx ? "-" : "+"}
                </span>
              </button>
              {openIndex === idx ? (
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                  {(() => {
                    const lines = faq.answer
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean);
                    const blocks = [];
                    let paraBuffer = [];

                    const flushPara = () => {
                      if (paraBuffer.length) {
                        blocks.push({
                          type: "para",
                          text: paraBuffer.join(" "),
                        });
                        paraBuffer = [];
                      }
                    };

                    lines.forEach((line) => {
                      if (
                        line.endsWith(".") ||
                        line.endsWith("!") ||
                        line.endsWith("?")
                      ) {
                        flushPara();
                        blocks.push({ type: "bullet", text: line });
                      } else {
                        paraBuffer.push(line);
                      }
                    });
                    flushPara();

                    const hasBullets = blocks.some((b) => b.type === "bullet");

                    return (
                      <div className="space-y-2">
                        {blocks.map((block, bi) =>
                          block.type === "bullet" ? (
                            <div key={bi} className="flex items-start gap-2">
                              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#374151]" />
                              <p className="text-[13px] leading-relaxed text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[14px]">
                                {block.text}
                              </p>
                            </div>
                          ) : (
                            <p
                              key={bi}
                              className={`text-[13px] leading-relaxed text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[14px] ${
                                hasBullets ? "pl-4" : ""
                              }`}
                            >
                              {block.text}
                            </p>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
