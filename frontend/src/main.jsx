import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "keen-slider/keen-slider.min.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import { createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
const theme = createTheme({
  typography: {
    fontFamily: [
      "Elmessiri",
      "Elmessiri-Regular",
      "Elmessiri-SemiBold",
      "Elmessiri-Bold",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiInput: {
      styleOverrides: {
        underline: {
          "&:after": {
            borderBottomColor: "black",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "black",
          },
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
