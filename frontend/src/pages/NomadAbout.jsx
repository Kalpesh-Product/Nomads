import React, { useState } from "react";
// import axios from "../utils/axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import Spinners from "../components/Spinner";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import Container from "../components/Container";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import blueUnderline from "../assets/blue_underline.png";

const NomadAbout = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      typeOfPartnerShip: "",
      message: "",
    },
  });

  const handleCloseModal = () => setShowModal(false);

  // const { mutate: submitContactForm, isPending: isContactPending } =
  //   useMutation({
  //     mutationFn: async (data) => {
  //       const response = await axios.post("forms/add-new-b2c-form-submission", {
  //         ...data,
  //         sheetName: "Connect_with_us",
  //       });
  //       return response.data;
  //     },
  //     onSuccess: (data) => {
  //       toast.success("Form submitted successfully");
  //       reset();
  //     },
  //     onError: (error) => {
  //       toast.error(error.response.data.message);
  //     },
  //   });

  const floatingLabelSx = {
    color: "black",
    "&.Mui-focused": { color: "#1976d2" },
    "&.MuiInputLabel-shrink": { color: "#1976d2" },
  };

  return (
    <div className="bg-white text-[#364D59] font-sans">
      <section className="px-6 lg:px-28 py-4 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center relative font-comic uppercase font-bold text-secondary-dark text-[clamp(1.5rem,4vw,3rem)] leading-tight mb-4">
          <div className="relative inline-block">
            <h3 className="text-center">About WONO</h3>
            <img
              src={blueUnderline}
              alt="blue underline"
              className="absolute top-full left-1/2 -translate-x-1/2 w-full h-[40%]"
            />
          </div>
        </div>

        {/* About Content */}
        <div className="flex flex-col gap-4 text-[1rem] leading-relaxed">
          <p>
            <strong>WONO</strong> is redefining the global future of work and
            mobility for the growing Digital Nomad's & Nomad Businesses
            Ecosystem.
          </p>
          <p>
            We are building a unified digital ecosystem that connects the
            world’s{" "}
            <strong>
              remote professionals, digital nomads, and flexible enterprises
            </strong>{" "}
            to the spaces and services they need — anywhere, anytime.
          </p>
          <p>
            Through our platform, Nomad's can discover and book curated Nomad
            Businesses such as{" "}
            <strong>
              co-working spaces, co-living communities, serviced apartments,
              hostels, workation spaces and working cafés
            </strong>{" "}
            — seamlessly integrated under our brand.
          </p>
          <p>
            As global work patterns evolve, WONO empowers people and companies
            to operate <strong>borderlessly</strong>, supporting the new
            generation of professionals who value{" "}
            <strong>freedom, flexibility, and community</strong> over location.
          </p>

          {/* Mission */}
          <h4 className="font-semibold uppercase mt-8 text-[1.25rem]">
            OUR MISSION
          </h4>
          <ul className="list-disc ml-6">
            <li>
              To support and activate 100% of the World's Nomad Businesses under
              one roof
            </li>
            <li>
              To simplify the global remote work experience by connecting
              individuals and organizations with a trusted nomad businesses
              network of work, stay, and lifestyle solutions across the world.
            </li>
          </ul>

          {/* Vision */}
          <h4 className="font-semibold uppercase mt-8 text-[1.25rem]">
            OUR VISION
          </h4>
          <ul className="list-disc ml-6">
            <li>
              To become the world’s leading platform for borderless living and
              working — enabling a truly global, connected, and mobile
              workforce.
            </li>
            <li>
              Build the LARGEST Community of NOMADS & NOMAD BUSINESS ACROSS THE
              WORLD!
            </li>
          </ul>

          {/* Edge */}
          <h4 className="font-semibold uppercase mt-8 text-[1.25rem]">
            OUR EDGE
          </h4>
          <ul className="list-disc ml-6">
            <li>
              World's LARGEST integrated curated platform combining{" "}
              <strong>work, stay, and travel services</strong>
            </li>
            <li>B2B Partnerships across major digital-nomad destinations</li>
            <li>
              Data-driven insights into global mobility and workforce trends
            </li>
            <li>
              Designed for both <strong>individual professionals</strong> and{" "}
              <strong>remote-first teams</strong>
            </li>
          </ul>

          <p>
            At WONO, we’re not just following the future of work —{" "}
            <strong>we’re building it.</strong>
          </p>

          <p className="font-semibold">
            A Platform which is an Early Adaptation of our Future Lifestyle!
          </p>
        </div>
      </section>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <AiOutlineClose size={20} />
            </button>
            <h3 className="text-lg font-bold mb-2">Success</h3>
            <p className="text-sm mb-4">
              Your enquiry has been submitted successfully!
            </p>
            <div className="text-right">
              <button
                onClick={handleCloseModal}
                className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <Spinners animation="border" variant="dark" />
        </div>
      )}
    </div>
  );
};

export default NomadAbout;
