import {
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import PrimaryButton from "../components/PrimaryButton";
import { Link } from "react-router-dom";
import MuiModal from "../components/Modal";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Country, State } from "country-state-city";

export default function Signup() {
  const [openModal, setOpenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: "",
      state: "",
      mobile: "",
      reason: "",
    },
  });

  const selectedCountry = watch("country");

  const { mutate: submitRegisteration, isPending: isRegisterationPending } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post("forms/register-form-submission", {
          ...data,
          sheetName: "Sign_up",
        });
        return response.data;
      },
      onSuccess: () => {
        toast.success("Sign up successful");
        reset();
        setOpenModal(true);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Something went wrong");
      },
    });

  const onSubmit = (data) => submitRegisteration(data);

  const countries = Country.getAllCountries();
  const selectedCountryObj = countries.find((c) => c.name === selectedCountry);
  const states = selectedCountryObj
    ? State.getStatesOfCountry(selectedCountryObj.isoCode)
    : [];

  return (
    <div className="flex items-center justify-center px-4 md:h-[60vh] lg:h-[80vh] border-gray-300 rounded-lg">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <h1 className="text-hero">Signup</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <Controller
            name="firstName"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Last Name */}
          <Controller
            name="lastName"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Mobile */}
          <Controller
            name="mobile"
            control={control}
            rules={{ required: "Mobile number is required" }}
            render={({ field, fieldState }) => (
              <MuiTelInput
                {...field}
                label="Mobile"
                fullWidth
                required
                defaultCountry="IN"
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />

          {/* Country */}
          <Controller
            name="country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Country"
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("state", ""); // reset state when country changes
                }}>
                {countries.map((c) => (
                  <MenuItem key={c.isoCode} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* State */}
          <Controller
            name="state"
            control={control}
            rules={{ required: "State is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="State"
                fullWidth
                required
                variant="standard"
                disabled={!selectedCountryObj}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}>
                {states.map((s) => (
                  <MenuItem key={s.isoCode} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2">
            <PrimaryButton
              type="submit"
              isLoading={isRegisterationPending}
              title="Signup"
              disabled={isRegisterationPending}
              className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-[7rem] px-6"
            />
          </div>

          {/* Login Link */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-center">
              Already have an account?&nbsp;
              <span className="underline">
                <Link to="/login">Log In</Link>
              </span>
            </p>
          </div>
        </form>

        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Registration Successful"
          height="20vh"
          width="30vw"
          color="text-green-500">
          <div className="flex flex-col space-y-4 text-pretty">
            <p>Thank you for signing up with BRIDG.</p>
            <p>
              Kindly allow us some time to evaluate your profile. Once done,
              your Personal Assistant from WoNo will connect with you to onboard
              you for your Signup process.
            </p>
            <p>Thank you again for trusting us and signing up!</p>
          </div>
        </MuiModal>
      </div>
    </div>
  );
}
