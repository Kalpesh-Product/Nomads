import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "../utils/axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import GetStartedButton from "../components/GetStartedButton";

const JobApplicationForm = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    dateOfBirth: null,
    mobile: "",
    state: "",
    experienceYears: "",
    linkedin: "",
    resumeLink: null,
    currentMonthlySalary: "",
    expectedMonthlySalary: "",
    joinInDays: "",
    relocateGoa: "",
    personality: "",
    skills: "",
    whyConsider: "",
    willingToBootstrap: "",
    message: "",
    jobPosition: "",
    submissionDate: null,
    submissionTime: null,
    status: "",
    remarks: "",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: null,
      mobile: "",
      location: "",
      experienceYears: "",
      linkedin: "",
      resumeLink: null,
      currentMonthlySalary: "",
      expectedMonthlySalary: "",
      joinInDays: "",
      relocateGoa: "",
      personality: "",
      skills: "",
      whyConsider: "",
      willingToBootstrap: "",
      message: "",
      jobPosition: "",
      submissionDate: null,
      submissionTime: null,
      status: "",
      remarks: "",
    },
  });

  const { mutate: submitJobApplication, isLoading } = useMutation({
    mutationFn: async (data) => {
      const formatDOB = dayjs(data.dateOfBirth).format("YYYY-MM-DD");
      const formatSubmissionDate = dayjs(data.submissionDate).format(
        "YYYY-MM-DD"
      );
      const formatSubmissionTime = dayjs(data.submissionTime).format(
        "HH:mm:ss"
      );

      const formattedData = {
        ...data,
        submissionDate: formatSubmissionDate,
        submissionTime: formatSubmissionTime,
        experienceYears: parseInt(data.experienceYears),
        dob: formatDOB,
        personality:
          "A detail-oriented and adaptable developer who enjoys solving complex problems and learning new technologies.",
        skills:
          "Proficient in MERN stack, REST APIs, and responsive UI design; experienced with state management and database optimization.",
        whyConsider:
          "I bring a balance of technical expertise and collaborative mindset to deliver scalable, high-quality solutions efficiently.",
        willingToBootstrap:
          "Yes, I’m eager to contribute my skills and grow alongside the company.",
        message:
          "Excited about the opportunity to work on impactful projects and contribute to your team’s success.",
      };

      const formData = new FormData();
      formData.append("formName", "jobApplication");

      // Append all fields
      Object.keys(formattedData).forEach((key) => {
        if (key === "resumeLink" && formattedData[key]) {
          formData.append(key, formattedData[key]); // File
        } else {
          formData.append(key, formattedData[key] ?? "");
        }
      });
      const response = await axios.post(
        "form/add-new-b2b-form-submission",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      reset();
    },
  });

  return (
    <div className="text-sm text-gray-800 w-full">
      <h3 className="text-lg font-semibold mb-6 text-center">
        APPLICATION FORM
      </h3>

      <form
        onSubmit={handleSubmit((data) => submitJobApplication(data))}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Name" fullWidth variant="standard" />
          )}
        />

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Email" fullWidth variant="standard" />
          )}
        />

        {/* Date of Birth */}
        {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date of Birth"
              value={field.value || null}
              onChange={field.onChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "standard",
                },
              }}
            />
          )}
        />
        {/* </LocalizationProvider>  */}

        {/* Mobile */}
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mobile Number"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* State */}
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="standard">
              <InputLabel>State</InputLabel>
              <Select {...field}>
                <MenuItem value="Goa">Goa</MenuItem>
                <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                <MenuItem value="Karnataka">Karnataka</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Experience */}
        <Controller
          name="experienceYears"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Experience (in years)"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* Job Position */}
        <Controller
          name="jobPosition"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Job Position"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Status" fullWidth variant="standard" />
          )}
        />

        {/* Current Salary */}
        <Controller
          name="currentMonthlySalary"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Current Monthly Salary"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* Expected Salary */}
        <Controller
          name="expectedMonthlySalary"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Expected Monthly Salary"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* LinkedIn */}
        <Controller
          name="linkedin"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="LinkedIn Profile URL"
              fullWidth
              variant="standard"
            />
          )}
        />

        {/* Resume Upload */}
        <Controller
          name="resumeLink"
          control={control}
          render={({ field }) => (
            <>
              <TextField
                variant="standard"
                fullWidth
                label="Upload Resume / CV"
                value={field.value?.name || ""}
                InputProps={{ readOnly: true }}
                onClick={() =>
                  document.getElementById("resumeLink-upload").click()
                }
              />
              <input
                type="file"
                id="resumeLink-upload"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => field.onChange(e.target.files[0])}
              />
            </>
          )}
        />

        {/* Submission Date */}
        <Controller
          name="submissionDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Submission Date"
              value={field.value || null}
              onChange={field.onChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "standard",
                },
              }}
            />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name="submissionTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Submission Time"
                value={field.value || null}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "standard",
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>

        {/* Join Time */}
        <Controller
          name="joinInDays"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="standard">
              <InputLabel>How Soon Can You Join?</InputLabel>
              <Select {...field}>
                <MenuItem value="Immediately">Immediately</MenuItem>
                <MenuItem value="1 Week">1 Week</MenuItem>
                <MenuItem value="2 Weeks">2 Weeks</MenuItem>
                <MenuItem value="30 Days">30 Days</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Relocate */}
        <Controller
          name="relocateGoa"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="standard">
              <InputLabel>Relocate to Goa</InputLabel>
              <Select {...field}>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Personality */}
        <Controller
          name="personality"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Who are you as a person?"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Skills */}
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="What skill set you have for the job you have applied?"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Reason */}
        <Controller
          name="whyConsider"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Why should we consider you for joining our company?"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Willing */}
        <Controller
          name="willingToBootstrap"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Are you willing to join a growing startup?"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Message */}
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Personal Message"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Remarks */}
        <Controller
          name="remarks"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Remarks"
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
              variant="standard"
            />
          )}
        />

        {/* Submit */}
        <div className="md:col-span-2 text-center mt-2 pb-10">
          <Button
            variant="contained"
            type="submit"
            
            sx={{
              backgroundColor: "black",
              borderRadius: "9999px",
              px: 4,
              py: 1,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            {isLoading && (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            )}
            {isLoading ? "Submitting..." : "SUBMIT"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
