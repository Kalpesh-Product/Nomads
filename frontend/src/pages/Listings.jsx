import { MenuItem, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";

const Listings = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  const listings = [
    {
      id: 1,
      name: "BIZNest",
      rating: 4.9,
      location: "Panjim, GOA",
      reviews: 120,
      price: "INR 259 per day",
      note: "*Also available on Monthly basis",
      image: "", // add image URL here
    },
    {
      id: 2,
      name: "NestSpace",
      rating: 4.7,
      location: "Bangalore, KA",
      reviews: 98,
      price: "INR 349 per day",
      note: "*Also available on Weekly basis",
      image: "",
    },
    {
      id: 3,
      name: "HiveHub",
      rating: 4.8,
      location: "Mumbai, MH",
      reviews: 145,
      price: "INR 299 per day",
      note: "*Monthly plans available",
      image: "",
    },
    {
      id: 4,
      name: "CoWorkZone",
      rating: 4.6,
      location: "Hyderabad, TS",
      reviews: 112,
      price: "INR 199 per day",
      note: "*Also available on Hourly basis",
      image: "",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 justify-between">
        <form
          onSubmit={handleSubmit((data) => locationData(data))}
          className="flex gap-2 items-center border-2 border-primary-blue rounded-full pl-4 overflow-hidden"
        >
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                size="small"
                variant="standard"
                label="Select Country"
                slotProps={{ input: { disableUnderline: true } }}
              >
                <MenuItem value="" disabled>
                  Select A Country
                </MenuItem>
                <MenuItem value="india">India</MenuItem>
              </TextField>
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                size="small"
                variant="standard"
                label="Select Country"
                slotProps={{ input: { disableUnderline: true } }}
              >
                <MenuItem value="" disabled>
                  Select A Location
                </MenuItem>
                <MenuItem value="goa">Goa</MenuItem>
              </TextField>
            )}
          />
          <div className="w-full border-l-2 border-l-primary-blue px-2 h-full">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  variant="standard"
                  label="Select Category"
                  slotProps={{ input: { disableUnderline: true } }}
                >
                  <MenuItem value="" disabled>
                    Select A Category
                  </MenuItem>
                  <MenuItem value="coWorking">Co-Working</MenuItem>
                </TextField>
              )}
            />
          </div>
          <div className="bg-primary-blue h-full w-20 flex justify-center">
            <button
              type="submit"
              className=" flex w-20 justify-center items-center"
            >
              <CiSearch />
            </button>
          </div>
        </form>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 justify-between h-96 w-full bg-white p-4 rounded-lg shadow-md"
            >
              <div className="h-3/4 w-full overflow-hidden rounded-xl border-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="h-[25%] flex flex-col gap-1">
                <div className="flex w-full justify-between items-center">
                  <p className="text-sm">{item.name}</p>
                  <p className="text-sm">{item.rating}</p>
                </div>

                <div className="flex w-full justify-between items-center">
                  <p className="text-sm">{item.location}</p>
                  <p className="text-sm">Reviews({item.reviews})</p>
                </div>

                <div className="flex w-full justify-between items-center">
                  <p className="text-sm">Starting from {item.price}</p>
                </div>

                <div className="flex w-full justify-between items-center">
                  <p className="text-sm">{item.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>map here</div>
      </div>
    </div>
  );
};

export default Listings;
