import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "../utils/axios";

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

  const { mutate: submitJobApplication, isPending } = useMutation({
    mutationFn: async (data) => {
      console.log("data",data)
      const response = await axios.post("job/add-new-job-post", data);

      return response.data
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  //   if (files) {
  //     setFormValues((prev) => ({ ...prev, [name]: files[0] }));
  //   } else {
  //     setFormValues((prev) => ({ ...prev, [name]: value }));
  //   }
  // };

  // const handleDateChange = (newValue) => {
  //   setFormValues((prev) => ({ ...prev, dateOfBirth: newValue }));
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(formValues);
  //   // Submit logic here
  // };

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
                onClick={() => document.getElementById("resumeLink-upload").click()}
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

        {/* Submission Time */}
        <Controller
          name="submissionTime"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Submission Time"
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
              label="Are you willingToBootstrap to bootstrap to join a growing startup?"
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
            SUBMIT
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
