// src/features/location/locationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formValues: {
    continent: "",
    country: "",
    location: "",
    category: "",
    count: "",
  },
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setFormValues: (state, action) => {
      const nextFormValues = action.payload || initialState.formValues;
      const previousFormValues = state.formValues || {};
      const keys = new Set([
        ...Object.keys(previousFormValues),
        ...Object.keys(nextFormValues),
      ]);
      const hasChanged = Array.from(keys).some(
        (key) => previousFormValues[key] !== nextFormValues[key],
      );

      if (!hasChanged) return;

      state.formValues = nextFormValues;
    },
    clearFormValues: (state) => {
      state.formValues = initialState.formValues;
    },
  },
});

export const { setFormValues, clearFormValues } = locationSlice.actions;
export default locationSlice.reducer;
