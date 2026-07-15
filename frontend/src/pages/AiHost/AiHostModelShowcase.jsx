import React from "react";
import { useNavigate } from "react-router-dom";
import websiteImage from "../../assets/images-service/services-frontend.jpeg";
import GetStartedButton from "../../components/GetStartedButton";
import MySeperator from "../../components/MySeperator";

const AiHostModelShowcase = () => {
    const navigate = useNavigate();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
            <div>
                <img
                    src={websiteImage}
                    alt="Build and manage website"
                    className="h-[260px] w-full object-cover md:h-[380px]"
                />

                <div className="space-y-5 p-6 md:p-10">
                    <h1 className="text-2xl font-semibold text-black md:text-4xl">
                        Build &amp; Manage Website
                    </h1>
                    <p className="text-sm leading-7 text-black/80 md:text-base">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                        non magna ut felis consequat vestibulum. Pellentesque habitant morbi
                        tristique senectus et netus et malesuada fames ac turpis egestas.
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                        posuere cubilia curae; Proin vulputate, leo et feugiat efficitur,
                        magna est malesuada lorem, at interdum ligula nibh sed arcu.
                    </p>
                </div>
            </div>
            <MySeperator />
            <div className="flex w-full flex-col items-center justify-center pt-8 pb-0">
                <div className="text-[clamp(1.2rem,2.5vw,7rem)] font-semibold text-center text-secondary-dark">
                    ACTIVATE YOUR MODERN NOMAD BUSINESS NOW.
                </div>
                <div className="justify-center pb-4 pt-4">
                    <GetStartedButton
                        title={"Get Started"}
                        handleSubmit={() => navigate("/signup?step=1")}
                    />
                </div>
            </div>
        </div>
    );
};

export default AiHostModelShowcase;
