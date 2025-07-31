import { MenuItem, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";

const Listings = () => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

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
      image:
        "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp", // add image URL here
    },
    {
      id: 2,
      name: "NestSpace",
      rating: 4.7,
      location: "Bangalore, KA",
      reviews: 98,
      price: "INR 349 per day",
      note: "*Also available on Weekly basis",
      image:
        "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp", // add image URL here
    },
    {
      id: 3,
      name: "HiveHub",
      rating: 4.8,
      location: "Mumbai, MH",
      reviews: 145,
      price: "INR 299 per day",
      note: "*Monthly plans available",
      image:
        "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp", // add image URL here
    },
    {
      id: 4,
      name: "CoWorkZone",
      rating: 4.6,
      location: "Hyderabad, TS",
      reviews: 112,
      price: "INR 199 per day",
      note: "*Also available on Hourly basis",
      image:
        "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp", // add image URL here
    },
  ];
  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 ">
        <div className="flex flex-col gap-4 justify-between md:w-3/4 w-1/2 h-full">
          <form
            onSubmit={handleSubmit((data) => locationData(data))}
            className="flex gap-2 items-center border-2 border-primary-blue rounded-full pl-4 overflow-hidden h-16"
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
            <div className="w-full border-l-2 border-l-primary-blue  flex h-full pl-4 ">
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
            <div className="bg-primary-blue w-1/2 h-full text-subtitle flex justify-center items-center">
             <CiSearch />
            </div>
            </div>
          </form>
        </div>
      </div>
      <hr />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          <div className="  font-semibold text-lg ">
            <div className="pb-6">
              <p>Over 16 Co - Working Space</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`${item.name}`)}
                  className="flex flex-col gap-4 justify-between h-96 w-full bg-white p-4 rounded-lg shadow-md hover:scale-105 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* ⬇️ Make image container relative to allow absolutely positioning the heart */}
                  <div className="h-3/4 w-full overflow-hidden rounded-xl border-2 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    {/* ❤️ Heart icon positioned top-right over the image */}
                    <div
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {favorites.includes(item.id) ? (
                        <AiFillHeart className="text-white" size={22} />
                      ) : (
                        <AiOutlineHeart className="text-white" size={22} />
                      )}
                    </div>
                  </div>

                  {/* 👇 Existing card content below the image stays untouched */}
                  <div className="h-[25%] flex flex-col gap-1">
                    <div className="flex w-full justify-between items-center">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <div className="flex items-center gap-1 text-black">
                        <AiFillStar size={16} />
                        <p className="text-sm font-semibold text-black">
                          {item.rating}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full justify-between items-center">
                      <p className="text-sm text-gray-600">{item.location}</p>
                      <p className="text-sm font-semibold">
                        Reviews({item.reviews})
                      </p>
                    </div>

                    <div className="flex w-full justify-between items-center">
                      <p className="text-sm font-semibold">
                        Starting from {item.price}
                      </p>
                    </div>

                    <div className="flex w-full justify-between items-center">
                      <p className="text-xs text-gray-600">{item.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-full w-full overflow-hidden rounded-xl">
            <Map />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Listings;
