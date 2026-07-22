import { useMemo, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    CircularProgress,
} from "@mui/material";
import Spinner from "../../components/Spinner";
import Container from "../../components/Container";
import axios from "../../utils/axios";
import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import { isValidInternationalPhone } from "../../utils/validators";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Country } from "country-state-city";
import { HiCheck } from "react-icons/hi";

const getFlagIconUrl = (isoCode) =>
    `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;

const tickMenuItemSx = {
    "& .tick-icon": { opacity: 0, color: "#1976d2" },
    "&:hover .tick-icon": { opacity: 1 },
    "&.Mui-selected .tick-icon": { opacity: 1 },
    "&.Mui-selected:hover .tick-icon": { opacity: 1 },
};

const AiHostContact = () => {
    const [loading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const countries = useMemo(() => Country.getAllCountries(), []);

    const navigate = useNavigate();
    const onBack = () => navigate("/");

    const { control, handleSubmit, reset, getValues } = useForm({
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            contactCode: "+91",
            contactNumber: "",
            partnerstype: "", // ✅ changed here
            message: "",
        },
    });

    const { mutate: submitContactForm, isPending: isContactPending } =
        useMutation({
            mutationFn: async (data) => {
                const response = await axios.post("forms/add-new-b2b-form-submission", {
                    ...data,
                    formName: "connect",
                });
                return response.data;
            },
            onSuccess: () => {
                showSuccessAlert("Form submitted successfully");
                reset();
            },
            onError: (error) => {
                showErrorAlert(error.response.data.message);
            },
        });

    const handleCloseModal = () => setShowModal(false);

    const handleContactSubmit = ({ contactCode, contactNumber, ...data }) => {
        submitContactForm({
            ...data,
            mobile: `${contactCode}${contactNumber}`,
        });
    };

    const floatingLabelSx = {
        color: "black",
        "&.Mui-focused": { color: "#1976d2" },
        "&.MuiInputLabel-shrink": { color: "#1976d2" },
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-white/95 py-3 backdrop-blur-sm md:px-28">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500"
                    aria-label="Go back to search results"
                >
                    <HiOutlineArrowLeft size={18} />
                </button>
            </div>
            <div className="bg-white text-black font-sans">
                {/* About & Form */}
                {/* <section className="py-10 px-4 md:px-20"> */}
                <Container padding={false}>
                    <section className="min-h-[85vh] flex items-start justify-center pt-10">
                        <div className="w-full max-w-5xl">
                            {/* About Us */}
                            {/* <div className="space-y-6">
              <h2 className="text-title font-semibold uppercase">About WONO</h2>
              <p className="text-tiny leading-relaxed">
                <strong>WONO</strong> is redefining the global future of work
                and mobility for the growing Digital Nomad's & Nomad Businesses
                Ecosystem.
              </p>
              <p className="text-tiny leading-relaxed">
                We are building a unified digital ecosystem that connects the
                world’s{" "}
                <strong>
                  remote professionals, digital nomads, and flexible enterprises
                </strong>{" "}
                to the spaces and services they need — anywhere, anytime.
              </p>
              <p className="text-tiny leading-relaxed">
                Through our platform, Nomad's can discover and book curated
                Nomad Businesses such as
                <strong>
                  {" "}
                  co-working spaces, co-living communities, serviced apartments,
                  hostels, workation spaces and working cafés
                </strong>{" "}
                — seamlessly integrated under our brand.
              </p>
              <p className="text-tiny leading-relaxed">
                As global work patterns evolve, WONO empowers people and
                companies to operate <strong>borderlessly</strong>, supporting
                the new generation of professionals who value{" "}
                <strong>freedom, flexibility, and community </strong>
                over location.
              </p>

         
              <h3 className="font-semibold uppercase mt-8">OUR MISSION</h3>
              <ul className="list-disc ml-6 text-tiny leading-relaxed">
                <li>
                  To support and activate 100% of the World's Nomad Businesses
                  under one roof
                </li>
                <li>
                  To simplify the global remote work experience by connecting
                  individuals and organizations with a trusted nomad businesses
                  network of work, stay, and lifestyle solutions across the
                  world.
                </li>
              </ul>

       
              <h3 className="font-semibold uppercase mt-8">OUR VISION</h3>
              <ul className="list-disc ml-6 text-tiny leading-relaxed">
                <li>
                  To become the world’s leading platform for borderless living
                  and working — enabling a truly global, connected, and mobile
                  workforce.
                </li>
                <li>
                  Build the LARGEST Community of NOMADS & NOMAD BUSINESS ACROSS
                  THE WORLD!
                </li>
              </ul>

    
              <h3 className="font-semibold uppercase mt-8">OUR EDGE</h3>
              <ul className="list-disc ml-6 text-tiny leading-relaxed">
                <li>
                  World's LARGEST Integrated curated platform combining{" "}
                  <strong>work, stay, and travel services</strong>
                </li>
                <li>
                  B2B Partnerships across major digital-nomad destinations
                </li>
                <li>
                  Data-driven insights into global mobility and workforce trends
                </li>
                <li>
                  Designed for both <strong>individual professionals</strong>{" "}
                  and <strong>remote-first teams</strong>
                </li>
              </ul>

              <p className="text-tiny leading-relaxed">
                At WONO, we’re not just following the future of work —{" "}
                <strong>we’re building it.</strong>
              </p>

              <p className="text-tiny font-semibold">
                A Platform which is an Early Adaptation of our Future Lifestyle!
              </p>
            </div> */}

                            {/* Connect With Us - MUI Styled Form */}
                            <div className="md:px-40">
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit(handleContactSubmit)}
                                    sx={{ mt: 0 }}
                                >
                                    <h2 className="text-title font-semibold uppercase mb-4 text-center md:text-center">
                                        Connect With Us
                                    </h2>

                                    {/* Responsive grid container */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div className="pt-0 pl-0 lg:pt-0 lg:pl-0">
                                            <Controller
                                                name="name"
                                                control={control}
                                                rules={{ required: "Name is required" }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        required
                                                        fullWidth
                                                        label="Name"
                                                        variant="standard"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        InputLabelProps={{ sx: floatingLabelSx }}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="pt-0 pl-0 lg:pt-0 lg:pl-0">
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^\S+@\S+$/i,
                                                        message: "Enter a valid email",
                                                    },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        required
                                                        fullWidth
                                                        type="email"
                                                        label="Email"
                                                        variant="standard"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        InputLabelProps={{ sx: floatingLabelSx }}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Contact Number */}
                                        <div className="pt-0 pl-0 lg:pt-0 lg:pl-0">
                                            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                                                <Controller
                                                    name="contactCode"
                                                    control={control}
                                                    rules={{ required: "Code is required" }}
                                                    render={({ field, fieldState }) => {
                                                        return (
                                                            <TextField
                                                                {...field}
                                                                select
                                                                label="Code"
                                                                variant="standard"
                                                                required
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                InputLabelProps={{ sx: floatingLabelSx }}
                                                                sx={{ width: "35%" }}
                                                            >
                                                                {countries.map((country) => {
                                                                    const phoneCode = `+${country.phonecode}`;

                                                                    return (
                                                                        <MenuItem
                                                                            key={`${country.isoCode}-${phoneCode}`}
                                                                            value={phoneCode}
                                                                            sx={tickMenuItemSx}
                                                                        >
                                                                            <Box className="flex w-full items-center gap-2">
                                                                                <HiCheck className="tick-icon" size={16} />
                                                                                <Box className="flex items-center gap-1">
                                                                                    <Box
                                                                                        component="img"
                                                                                        src={getFlagIconUrl(country.isoCode)}
                                                                                        alt={`${country.name} flag`}
                                                                                        sx={{
                                                                                            width: 20,
                                                                                            height: 15,
                                                                                            flexShrink: 0,
                                                                                        }}
                                                                                        loading="lazy"
                                                                                    />
                                                                                    <span>{phoneCode}</span>
                                                                                </Box>
                                                                            </Box>
                                                                        </MenuItem>
                                                                    );
                                                                })}
                                                            </TextField>
                                                        );
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: "1px",
                                                        height: "100%",
                                                        backgroundColor: "#ccc",
                                                    }}
                                                />
                                                <Controller
                                                    name="contactNumber"
                                                    control={control}
                                                    rules={{
                                                        required: "Contact number is required",
                                                        pattern: {
                                                            value: /^[0-9]{7,15}$/,
                                                            message: "Please enter a valid phone number",
                                                        },
                                                        validate: (value) =>
                                                            isValidInternationalPhone(
                                                                `${getValues("contactCode")}${value}`,
                                                            ),
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            required
                                                            fullWidth
                                                            type="tel"
                                                            label="Contact Number"
                                                            variant="standard"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            InputLabelProps={{ sx: floatingLabelSx }}
                                                            sx={{ flex: 1 }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </div>

                                        {/* Partnership Type */}
                                        <div className="pt-0 pl-0 lg:pt-0 lg:pl-0">
                                            <Controller
                                                name="partnerstype" // ✅ changed here
                                                control={control}
                                                rules={{ required: "Please select a partnership type" }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        required
                                                        variant="standard"
                                                        error={!!fieldState.error}
                                                        label="Reason to Connect"
                                                        select
                                                        helperText={fieldState?.error?.message}
                                                        InputLabelProps={{ sx: floatingLabelSx }}
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Select Type
                                                        </MenuItem>
                                                        <MenuItem value="Add Your Business">
                                                            Add Your Business
                                                        </MenuItem>
                                                        <MenuItem value="Business Activation Query">
                                                            Business Activation Query
                                                        </MenuItem>
                                                        <MenuItem value="Value Adding Partnerships">
                                                            Value Adding Partnerships
                                                        </MenuItem>
                                                        <MenuItem value="Lead a Location for WoNo">
                                                            Lead a Location for WoNo
                                                        </MenuItem>
                                                        <MenuItem value="Become a Franchise Partner">
                                                            Become a Franchise Partner
                                                        </MenuItem>
                                                        <MenuItem value="PR Related Query">
                                                            PR Related Query
                                                        </MenuItem>
                                                        <MenuItem value="Join Our Team">
                                                            Join Our Team
                                                        </MenuItem>
                                                    </TextField>
                                                )}
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="pt-0 pl-0 lg:pt-0 lg:pl-0 md:col-span-2">
                                            <Controller
                                                name="message"
                                                control={control}
                                                rules={{ required: "Message is required" }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        required
                                                        fullWidth
                                                        multiline
                                                        minRows={4}
                                                        label="Message"
                                                        variant="standard"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        InputLabelProps={{ sx: floatingLabelSx }}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Button */}
                                        <div className="pt-6 md:col-span-2 text-center">
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={isContactPending}
                                                sx={{
                                                    bgcolor: "black",
                                                    borderRadius: 20,
                                                    px: 14,
                                                    py: 1,
                                                    "&:hover": { bgcolor: "#333" },
                                                }}
                                            >
                                                {isContactPending && (
                                                    <CircularProgress
                                                        size={16}
                                                        sx={{ color: "white", mr: 1 }}
                                                    />
                                                )}
                                                {isContactPending ? "CONNECTING..." : "CONNECT"}
                                            </Button>
                                        </div>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </section>
                </Container>

                {/* Maps */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-20 pb-10"> */}
                {/* <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="shadow-md">
            <iframe
              title="Singapore Office"
              className="w-full h-[25rem]"
              loading="lazy"
              src="https://www.google.com/maps?q=77%20HIGH%20STREET%2C%20%2310-12B%20HIGH%20STREET%20PLAZA%2C%20SINGAPORE%20179433&output=embed"></iframe>
            <div className="p-4 flex gap-2 text-sm items-start">
              <FaMapMarkerAlt className="mt-1 text-black" />
              <span>
                SINGAPORE OFFICE - WONOCO PRIVATE LIMITED, 77 HIGH STREET,
                #10-12B HIGH STREET PLAZA, SINGAPORE 179433
              </span>
            </div>
          </div>
          <div className="shadow-md">
            <iframe
              title="India Office"
              className="w-full h-[25rem]"
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.7765664747362!2d73.83261987495516!3d15.496445985103028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfc1d2e05cbef3%3A0xa643703ebcc4db43!2sBIZ%20Nest%20-%20Co-Working%20Space%2C%20Workations%20%26%20Meeting%20Zone%20in%20Goa!5e0!3m2!1sen!2sin!4v1723627911486!5m2!1sen!2sin"></iframe>
            <div className="p-4 flex gap-2 text-sm items-start">
              <FaMapMarkerAlt className="mt-1 text-black" />
              <span>
                INDIA OFFICE - WONOCO PRIVATE LIMITED, BIZ NEST CO-WORKING,
                SUNTECK KANAKA CORPORATE PARK, 701 - B, PATTO CENTRE, PANJIM,
                GOA - 403001
              </span>
            </div>
          </div>
        </div>
      </Container> */}

                {/* Modal */}
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
                        <Spinner animation="border" variant="dark" />
                    </div>
                )}
            </div>
        </>
    );
};

export default AiHostContact;
