import React, { useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Box } from "@mui/material";
import Container from "../../components/Container";

const steps = ["Account Info", "Company Info", "Payout Info", "Review"];

const HostSignup = () => {
  const [activeStep, setActiveStep] = useState(0);

  const { control, handleSubmit, getValues, trigger } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      companyAddress: "",
      payoutMethod: "",
      payoutDetails: "",
    },
  });

  // Validation rules per step
  const stepFields = [
    ["name", "email"], // Step 1 fields
    ["companyName", "companyAddress"], // Step 2 fields
    ["payoutMethod", "payoutDetails"], // Step 3 fields
    [], // Step 4 (no fields)
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return; // stop if invalid

    const stepValues = getValues();
    console.log(`Step ${activeStep + 1} values:`, stepValues);

    setActiveStep((prev) => prev + 1);
  };

  const handleFinalSubmit = (data) => {
    console.log("Final Merged Values:", data);
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  margin="normal"
                  type="email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </>
        );

      case 1:
        return (
          <>
            <Controller
              name="companyName"
              control={control}
              rules={{ required: "Company Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  fullWidth
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="companyAddress"
              control={control}
              rules={{ required: "Company Address is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Company Address"
                  fullWidth
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </>
        );

      case 2:
        return (
          <>
            <Controller
              name="payoutMethod"
              control={control}
              rules={{ required: "Payout Method is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Payout Method"
                  fullWidth
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="payoutDetails"
              control={control}
              rules={{ required: "Payout Details are required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Payout Details"
                  fullWidth
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </>
        );

      case 3:
        return <p>Review and Submit your details.</p>;

      default:
        return null;
    }
  };

  return (
    <Container>
      <Stepper
        connectorStateColors={true}
        styleConfig={{
          activeBgColor: "#2196F3", // Blue for the active step
          completedBgColor: "#4CAF50", // Green for completed steps
          inactiveBgColor: "#E0E0E0", // Color for inactive steps
          size: "2.5em", // Step size (Optional)
          activeTextColor: "#FFFFFF", // Text color for active step
          completedTextColor: "#FFFFFF", // Text color for completed steps
          inactiveTextColor: "#000000", // Text color for inactive steps
          circleFontSize: "1rem", // Font size for step number (Optional)
          fontFamily: "inherit",
        }}
        connectorStyleConfig={{
          size: 3, // Thickness of the connector line
          activeColor: "#4CAF50", // Color of the connector when active
          completedColor: "#4CAF50", // Color of the connector when completed
          inactiveColor: "#E0E0E0", // Color of the connector when inactive
        }}
        style={{ paddingTop: 0, textTransform: "uppercase", fontFamily:"Poppins" }}
        activeStep={activeStep}
      >
        {steps.map((label, index) => (
          <Step label={label} key={index} />
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(handleFinalSubmit)}>
        {renderStepFields()}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" type="submit">
              Submit
            </Button>
          )}
        </Box>
      </form>
    </Container>
  );
};

export default HostSignup;
