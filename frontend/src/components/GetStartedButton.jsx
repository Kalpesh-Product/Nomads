import { CircularProgress } from "@mui/material"; // Import MUI Spinner

const GetStartedButton = ({
  title = "Get Started",
  handleSubmit,
  type,
  fontSize,
  externalStyles,
  disabled,
  padding,
  className,
  isLoading, // New prop for showing the spinner
}) => {
  console.log("isLoading", isLoading);
  const baseBgColor = disabled || isLoading ? "bg-gray-400" : "bg-black";

  return (
    <button
      disabled={disabled || isLoading}
      type={type}
      className={`bg-black text-white px-10 py-3 rounded-full`}
      onClick={handleSubmit}>
      {isLoading && <CircularProgress size={16} sx={{ color: "#ffffff" }} />}
      <span className="text-center">{title}</span>
    </button>
  );
};

export default GetStartedButton;
