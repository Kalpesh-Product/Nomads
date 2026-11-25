import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import PrimaryButton from "../components/PrimaryButton";

const REDIRECT_SECONDS = 10;

const NotFound = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (secondsLeft !== 0) return;

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  }, [navigate, secondsLeft]);

  return (
    <main className="min-h-[100lvh] flex flex-col justify-center items-center bg-white px-4">
      <div className="flex min-h-[90lvh] w-full max-w-3xl flex-col items-center justify-center py-10">
        <figure className="flex flex-col w-full items-center justify-center gap-8">
          <img
            src="/images/main-page-1.png"
            alt="WONO"
            className="object-cover max-w-xs sm:max-w-sm md:max-w-md w-full"
          />

          <div className="text-center max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.25em] text-primary-blue uppercase">
              Error 404
            </p>
            <h1 className="text-title font-bold text-black py-4">
              Page not found
            </h1>
            <p className="text-subtitle text-secondary-dark/80">
              The page you’re looking for may have been moved, renamed, or is no
              longer available.
            </p>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-6">
              <p className="text-content md:text-lg text-secondary-dark">
                You’ll be redirected to the previous page in{" "}
                <span className="mx-1 inline-block min-w-[2ch] text-3xl font-bold text-primary-blue align-middle md:text-4xl">
                  {secondsLeft}
                </span>{" "}
                second{secondsLeft === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <PrimaryButton
                title="Go Back"
                handleSubmit={handleGoBack}
                className="w-full sm:w-auto bg-primary-blue hover:bg-[#0998d6] text-white font-medium px-6"
              />
              <PrimaryButton
                title="Go to Homepage"
                handleSubmit={handleGoHome}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-primary-blue border border-primary-blue font-medium px-6"
              />
            </div>
          </div>
        </figure>
      </div>

      <div className="flex justify-evenly items-center w-full flex-col sm:flex-col xs:flex-col lg:flex-row md:flex-row pt-2 pb-4">
        <div className="w-32 hidden lg:block" />
        <div className="w-full">
          <p className="text-center pb-2 text-tiny sm:text-tiny xs:text-tiny md:text-content lg:text-content text-secondary-dark/80">
            <span className="whitespace-nowrap">
              &copy; Copyright {new Date().getFullYear()}-
              {(new Date().getFullYear() + 1).toString().slice(-2)}
            </span>
            <span className="block sm:inline">
              {" "}
              WONOCO PRIVATE LIMITED – SINGAPORE. All Rights Reserved.
            </span>
          </p>
        </div>
        <div className="flex items-right justify-end gap-4 pb-2 px-6 w-32 text-secondary-dark/70">
          <FaFacebookF className="text-[12px]" />
          <FaXTwitter className="text-[12px]" />
          <FaInstagram className="text-[12px]" />
        </div>
      </div>
    </main>
  );
};

export default NotFound;
