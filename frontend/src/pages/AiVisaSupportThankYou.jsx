import React from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/Container";

const AiVisaSupportThankYou = () => {
  const [searchParams] = useSearchParams();
  const choice = searchParams.get("choice");

  const message =
    choice === "get-back-to-me"
      ? "Thanks for submitting your request. Our team will get back to you shortly."
      : "Thanks for submitting your request. We’ll help you with resources so you can continue your visa search confidently.";

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-8">
          <div className="w-full max-w-3xl px-6 md:px-10 text-center bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm py-16">
            <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-6">
              Thank You
            </h1>
            <p className="text-lg leading-relaxed">{message}</p>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AiVisaSupportThankYou;
