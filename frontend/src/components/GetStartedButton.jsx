import { CircularProgress } from "@mui/material"; // Import MUI Spinner

const GetStartedButton = ({
  title="Get Started",
  handleSubmit,
  type,
  fontSize,
  externalStyles,
  disabled,
  padding,
  className,
  isLoading, // New prop for showing the spinner
}) => {
  const baseBgColor = disabled || isLoading ? "bg-gray-400" : "bg-black";
  const hoverBgColor = disabled || isLoading ? "" : "hover:bg-secondary-light"; // Add hover color here

  return (
    <button
      disabled={disabled || isLoading}
      type={type}
      className={`flex rounded-full items-center cursor-pointer justify-center  gap-2
        ${baseBgColor} ${hoverBgColor} text-primary
        ${fontSize ? fontSize : "text-content leading-5"}
        ${externalStyles} ${padding ? padding : "px-8 py-2"} ${className}`}
      onClick={handleSubmit}>
      {isLoading && <CircularProgress size={16} sx={{ color: "#ffffff" }} />}
      <span className="text-center">{title}</span>
    </button>
  );
};

export default GetStartedButton;
