import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Container from "../components/Container";

const AiVisaSupportThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [typedMessage, setTypedMessage] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const choice = searchParams.get("choice");
  const selectedState = searchParams.get("state");
  const selectedCountry = searchParams.get("country");
  const selectedDestinationLabel = searchParams.get("destination");

  const destinationPath = useMemo(() => {
    if (!selectedState || !selectedCountry) {
      return "";
    }

    return `/ai-verticals?country=${encodeURIComponent(selectedCountry)}&state=${encodeURIComponent(selectedState)}`;
  }, [selectedCountry, selectedState]);

  const message =
    choice === "get-back-to-me"
      ? "Thanks for submitting your request. Our team will get back to you shortly."
      : "Thanks for submitting your request. Use the link below to continue your search confidently.";

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
    if (!destinationPath || !selectedDestinationLabel) {
      return undefined;
    }

    setSecondsRemaining(5);

    const countdownInterval = setInterval(() => {
      setSecondsRemaining((currentSecond) => {
        if (currentSecond <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }

        return currentSecond - 1;
      });
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      navigate(destinationPath);
    }, 7000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
    };
  }, [destinationPath, navigate, selectedDestinationLabel]);

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-8">
          <div className="w-full max-w-3xl px-6 md:px-10 text-center bg-white rounded-2xl border border-white  py-12 md:py-14">
            <p className="text-xl leading-relaxed font-play min-h-[72px]">
              {typedMessage}
            </p>

            {destinationPath && selectedDestinationLabel ? (
              <p className="mt-6 text-lg font-play font-semibold text-black/85">
                Redirecting You To{" "}
                <Link
                  to={destinationPath}
                  className="text-primary-blue underline underline-offset-4 hover:text-[#084f95]"
                >
                  {selectedDestinationLabel}
                </Link>
                {/* {" "} */}
                {/* in {secondsRemaining} seconds. */}
              </p>
            ) : null}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AiVisaSupportThankYou;
