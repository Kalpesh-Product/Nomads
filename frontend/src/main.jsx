import { createRoot } from "react-dom/client";
import "./index.css";
import "./sweetalert.css";
import "keen-slider/keen-slider.min.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { store, persistor } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthContextProvider from "./context/AuthContext.jsx";
const queryClient = new QueryClient();
const theme = createTheme({
  typography: {
    fontFamily: [
      "Poppins",
      "Poppins-Regular",
      "Poppins-SemiBold",
      "Poppins-Bold",
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
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "0.85rem", // 🔽 globally reduce selected value font size
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <AuthContextProvider>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <RouterProvider router={router} />
            </HelmetProvider>
          </QueryClientProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </PersistGate>
  </Provider>,
);
