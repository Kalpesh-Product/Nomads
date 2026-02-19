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
import React, { useState } from "react";
import dayjs from "dayjs";
import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import { useMutation } from "@tanstack/react-query";
import axios from "../../utils/axios";
import { isValidInternationalPhone } from "../../utils/validators";

const HostJobApplicationForm = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    dateOfBirth: null,
    mobile: "",
    state: "",
    experience: "",
    linkedIn: "",
    resume: null,
    currentSalary: "",
    expectedSalary: "",
    joinTime: "",
    relocate: "",
    personality: "",
    skills: "",
    reason: "",
    willing: "",
    message: "",
    jobPosition: "",
    submissionDate: null,
    submissionTime: null,
    status: "",
    remarks: "",
  });

  // Endpoint for hosts
  const customLink = "add-new-b2b-form-submission";

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormValues((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (newValue) => {
    setFormValues((prev) => ({ ...prev, dateOfBirth: newValue }));
  };

  const resetForm = () => {
    setFormValues({
      name: "",
      email: "",
      dateOfBirth: null,
      mobile: "",
      state: "",
      experience: "",
      linkedIn: "",
      resume: null,
      currentSalary: "",
      expectedSalary: "",
      joinTime: "",
      relocate: "",
      personality: "",
      skills: "",
      reason: "",
      willing: "",
      message: "",
      jobPosition: "",
      submissionDate: null,
      submissionTime: null,
      status: "",
      remarks: "",
    });
  };

  const { mutate: submitHostApplication, isPending } = useMutation({
    mutationFn: async () => {
      // Mirror the formatting from JobApplicationForm
      const formatDOB = formValues.dateOfBirth
        ? dayjs(formValues.dateOfBirth).format("YYYY-MM-DD")
        : "";

      const formatSubmissionDate = dayjs(new Date()).format("YYYY-MM-DD");
      const formatSubmissionTime = dayjs(new Date()).format("HH:mm:ss");

      // Map local state keys to backend-expected keys
      const formattedData = {
        name: formValues.name,
        email: formValues.email,
        dateOfBirth: formValues.dateOfBirth, // kept for parity, not sent directly
        mobile: formValues.mobile,
        // backend uses 'location'
        location: formValues.state || "",
        // backend uses 'experienceYears' as an integer
        experienceYears: formValues.experience
          ? parseInt(formValues.experience, 10)
          : "",
        linkedin: formValues.linkedIn || "",
        // backend expects 'resumeLink'; we’ll pass the file there
        resumeLink: formValues.resume || null,
        currentMonthlySalary: formValues.currentSalary || "",
        expectedMonthlySalary: formValues.expectedSalary || "",
        joinInDays: formValues.joinTime || "",
        relocateGoa: formValues.relocate || "",
        // personality:
        //   formValues.personality ||
        //   "A detail-oriented and adaptable developer who enjoys solving complex problems and learning new technologies.",
        // skills:
        //   formValues.skills ||
        //   "Proficient in MERN stack, REST APIs, and responsive UI design; experienced with state management and database optimization.",
        // whyConsider:
        //   formValues.reason ||
        //   "I bring a balance of technical expertise and collaborative mindset to deliver scalable, high-quality solutions efficiently.",
        // willingToBootstrap:
        //   formValues.willing ||
        //   "Yes, I’m eager to contribute my skills and grow alongside the company.",
        // message:
        //   formValues.message ||
        //   "Excited about the opportunity to work on impactful projects and contribute to your team’s success.",
        personality: formValues.personality,
        skills: formValues.skills,
        whyConsider: formValues.reason,
        willingToBootstrap: formValues.willing,
        message: formValues.message,

        status: formValues.status || "",
        remarks: formValues.remarks || "",

        // normalized/derived fields
        dob: formatDOB,
        submissionDate: formatSubmissionDate,
        submissionTime: formatSubmissionTime,
      };

      const formData = new FormData();

      // Hosts integration fields
      formData.append("formName", "jobApplication");
      formData.append("jobPosition", formValues.jobPosition || "");
      // For parity with your other form (Nomads uses sheetName, hosts don't need it, but harmless)
      formData.append("sheetName", "");

      // Append everything properly, sending file under 'resumeLink'
      Object.keys(formattedData).forEach((key) => {
        if (key === "resumeLink" && formattedData[key]) {
          formData.append("resumeLink", formattedData[key]); // file
        } else {
          formData.append(key, formattedData[key] ?? "");
        }
      });

      const response = await axios.post(`forms/${customLink}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccessAlert(data?.message || "Application submitted");
      resetForm();
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        "Submission failed. Try not angering the server next time.";
      showErrorAlert(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const phoneValidation = isValidInternationalPhone(formValues.mobile);
    if (phoneValidation !== true) {
      showErrorAlert(phoneValidation);
      return;
    }

    submitHostApplication();
  };

  return (
    <div className="text-sm text-gray-800 w-full">
      <h3 className="text-lg font-semibold mb-6 text-center">
        APPLICATION FORM
      </h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <TextField
          label="Name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />
        <TextField
          label="Email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <DatePicker
          label="Date of Birth"
          value={formValues.dateOfBirth}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "standard",
            },
          }}
        />

        <TextField
          label="Mobile Number"
          name="mobile"
          value={formValues.mobile}
          onChange={handleChange}
          fullWidth
          variant="standard"
          type="tel"
        />

        <FormControl fullWidth variant="standard">
          <InputLabel>State</InputLabel>
          <Select
            name="state"
            value={formValues.state}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Goa">Goa</MenuItem>
            <MenuItem value="Maharashtra">Maharashtra</MenuItem>
            <MenuItem value="Karnataka">Karnataka</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Experience (in years)"
          name="experience"
          value={formValues.experience}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          label="Job Position"
          name="jobPosition"
          value={formValues.jobPosition}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          label="Status"
          name="status"
          value={formValues.status}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          label="Current Monthly Salary"
          name="currentSalary"
          value={formValues.currentSalary}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          label="Expected Monthly Salary"
          name="expectedSalary"
          value={formValues.expectedSalary}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          label="LinkedIn Profile URL"
          name="linkedIn"
          value={formValues.linkedIn}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />

        <TextField
          variant="standard"
          fullWidth
          label="Upload Resume / CV"
          value={formValues.resume?.name || ""}
          InputProps={{ readOnly: true }}
          onClick={() => document.getElementById("resume-upload").click()}
        />
        <input
          type="file"
          name="resume"
          id="resume-upload"
          hidden
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
        />

        {/* Keeping these fields in UI for now; submission uses current date/time */}
        <DatePicker
          label="Submission Date"
          value={formValues.submissionDate}
          onChange={(v) => setFormValues((p) => ({ ...p, submissionDate: v }))}
          slotProps={{
            textField: { fullWidth: true, variant: "standard" },
          }}
        />
        <DatePicker
          label="Submission Time"
          value={formValues.submissionTime}
          onChange={(v) => setFormValues((p) => ({ ...p, submissionTime: v }))}
          slotProps={{
            textField: { fullWidth: true, variant: "standard" },
          }}
        />

        <FormControl fullWidth variant="standard">
          <InputLabel>How Soon Can You Join?</InputLabel>
          <Select
            name="joinTime"
            value={formValues.joinTime}
            onChange={handleChange}
          >
            <MenuItem value="Immediately">Immediately</MenuItem>
            <MenuItem value="1 Week">1 Week</MenuItem>
            <MenuItem value="2 Weeks">2 Weeks</MenuItem>
            <MenuItem value="30 Days">30 Days</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth variant="standard">
          <InputLabel>Relocate to Goa</InputLabel>
          <Select
            name="relocate"
            value={formValues.relocate}
            onChange={handleChange}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Who are you as a person?"
          name="personality"
          value={formValues.personality}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        />

        <TextField
          label="What skill set you have for the job you have applied?"
          name="skills"
          value={formValues.skills}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        />

        <TextField
          label="Why should we consider you for joining our company?"
          name="reason"
          value={formValues.reason}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        />

        <TextField
          label="Are you willing to bootstrap to join a growing startup?"
          name="willing"
          value={formValues.willing}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        />

        <TextField
          label="Personal Message"
          name="message"
          value={formValues.message}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        />
        {/* 
        <TextField
          label="Remarks"
          name="remarks"
          value={formValues.remarks}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          className="md:col-span-2"
          variant="standard"
        /> */}

        <div className="md:col-span-2 text-center mt-2 pb-10">
          <Button
            variant="contained"
            type="submit"
            disabled={isPending}
            sx={{
              backgroundColor: "black",
              borderRadius: "9999px",
              px: 4,
              py: 1,
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            {isPending && (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            )}
            {isPending ? "Submitting..." : "SUBMIT"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HostJobApplicationForm;
