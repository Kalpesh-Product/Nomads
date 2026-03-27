import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Container from "../components/Container";

const AiVisaSupportThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [typedMessage, setTypedMessage] = useState("");
  const selectedState = searchParams.get("state");
  const selectedCountry = searchParams.get("country");

  const destinationPath = useMemo(() => {
    if (!selectedState || !selectedCountry) {
      return "";
    }

    return `/ai-verticals?country=${encodeURIComponent(selectedCountry)}&state=${encodeURIComponent(selectedState)}`;
  }, [selectedCountry, selectedState]);

  const formattedState = useMemo(() => {
    if (!selectedState) {
      return "your selected state";
    }

    return selectedState
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [selectedState]);

  const message = `Thank you for the suggestion. Redirecting you to ${formattedState} for now`;

  useEffect(() => {
    setTypedMessage("");

    let index = 0;
    const typeInterval = setInterval(() => {
      index += 1;
      setTypedMessage(message.slice(0, index));

      if (index >= message.length) {
        clearInterval(typeInterval);
      }
    }, 25);

    return () => clearInterval(typeInterval);
  }, [message]);

  useEffect(() => {
    if (!destinationPath) {
      return undefined;
    }

    const redirectTimeout = setTimeout(() => {
      navigate(destinationPath);
    }, 7000);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [destinationPath, navigate]);

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-8">
          <div className="w-full max-w-3xl px-6 md:px-10 text-center bg-white rounded-2xl border border-white  py-12 md:py-14">
            <p className="text-xl leading-relaxed font-play min-h-[72px]">
              {typedMessage}
            </p>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AiVisaSupportThankYou;
