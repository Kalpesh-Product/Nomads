import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { useNavigate, useParams } from "react-router-dom";
import Map from "../components/Map";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axios.js";
import renderStars from "../utils/renderStarts.jsx";
import SkeletonCard from "../components/Skeletons/SkeletonCard.jsx";
import SkeletonMap from "../components/Skeletons/SkeletonMap.jsx";
import Select from "react-dropdown-select";
import { setFormValues } from "../features/locationSlice.js";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import PaginatedGrid from "../components/PaginatedGrid.jsx";
import newIcons from "../assets/newIcons.js";

const Listings = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const formData = useSelector((state) => state.location.formValues);
  const countryOptions = [{ label: "India", value: "india" }];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const categoryOptions = [
    { label: "Co-Working", value: "coworking" },
    { label: "Hostels", value: "hostels" },
    { label: "Cafe’s/Meeting Rooms", value: "cafeMeetings" },
    { label: "Private Stay", value: "privateStay" },
    { label: "Company Workation", value: "companyWorkation" },
  ];
  console.log("formData", formData);
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `common/location-and-type-based-company-data?country=${country}&state=${location}&category=${category}`
      );

      // return response.data;
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled:
      !!formData?.country && !!formData?.location && !!formData?.category, // ✅ prevents fetching on empty state
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  const { handleSubmit, control, reset, setValue } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  useEffect(() => {
    setValue("country", formData.country);
    setValue("location", formData.location);
    setValue("category", formData.category);
  }, [formData]);
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      dispatch(setFormValues(data));
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  const forMapsData = isLisitingLoading
    ? []
    : listingsData.map((item) => ({
        ...item,
        id: item._id,
        lat: item.latitude,
        lng: item.longitude,
        name: item.companyName,
        location: item.city,
        reviews: item.reviews.length,
        rating: item.reviews?.length
          ? (() => {
              const avg =
                item.reviews.reduce((sum, r) => sum + r.starCount, 0) /
                item.reviews.length;
              return avg % 1 === 0 ? avg : avg.toFixed(1);
            })()
          : "0",
        image:
          "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
      }));

  const handleCategoryClick = (categoryValue) => {
    const formData = getValues(); // from react-hook-form

    if (!formData.country || !formData.location) {
      alert("Please select Country and Location first.");
      return;
    }
    dispatch(setFormValues({ ...formData, category: categoryValue }));

    // const url = `/nomads/${formData.country}.${formData.location}/${categoryValue}`;
    const state = {
      ...formData,
      category: categoryValue,
    };

    // console.log("Generated URL:", url);
    console.log("State to be passed:", state);

    navigate(
      `/nomad/listings?country=${formData.country}&location=${formData.location}&category=${state.category}`,
      {
        state: {
          country: formData.country,
          location: formData.location,
          category: categoryValue,
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 ">
      <Container padding={false}>
        <div className="flex w-full items-center justify-between">
          {/* <button
            onClick={() =>
              navigate(`/nomad/${formData.country}/${formData.location}`)
            }
          >
            Back
          </button> */}
          <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
            <div className="flex flex-col gap-4 justify-between w-full h-full">
              {/* the 5 icons */}
              <div className=" w-full flex justify-center items-center">
                <div className="grid grid-cols-5 md:grid-cols-5 gap-2">
                  {categoryOptions.map((cat) => {
                    const iconSrc = newIcons[cat.value];

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryClick(cat.value)}
                        className=" text-black  px-4 py-2   hover:text-black transition flex items-center justify-center w-full">
                        {iconSrc ? (
                          <div className="h-10 w-full flex flex-col gap-0">
                            <img
                              src={iconSrc}
                              alt={cat.label}
                              className="h-full w-full object-contain"
                            />
                            <span className="text-sm">{cat.label}</span>
                            <div></div>
                          </div>
                        ) : (
                          cat.label // fallback if no icon found
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <form
                onSubmit={handleSubmit((data) => locationData(data))}
                className="flex gap-2 border-2 border-primary-blue rounded-full pl-4 h-10 lg:h-16 justify-between items-center bg-white">
                {/* Country */}
                <div className="relative w-full">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={countryOptions}
                        onChange={(values) => field.onChange(values[0]?.value)}
                        values={countryOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Country"
                        color="#0000"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          color: "black",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                {/* Location */}
                <div className="relative w-full border-l-2 border-l-primary-blue">
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={locationOptions}
                        onChange={(values) => field.onChange(values[0]?.value)}
                        values={locationOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Location"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                {/* Category */}
                <div className="relative w-full border-l-2 border-l-primary-blue pl-2">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={categoryOptions}
                        onChange={(values) => {
                          const newCategory = values[0]?.value;
                          field.onChange(newCategory); // update form
                          searchParams.set("category", newCategory); // update URL
                          setSearchParams(searchParams, { replace: true }); // push new URL
                        }}
                        values={categoryOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Category"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="bg-primary-blue h-full w-3/4 flex justify-center rounded-r-full">
                  <button
                    type="submit"
                    disabled={isLocation}
                    className="h-full text-center w-full flex justify-center items-center text-white">
                    <CiSearch className="text-lg" /> &nbsp; Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>
      <hr />
      <Container padding={false}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          <div className="  font-semibold text-lg ">
            <div className="pb-6">
              <p>
                Over {listingsData?.length - 1}{" "}
                {formData.category === "coworking" ? "Co-Working" : "Co-Living"}{" "}
                Spaces
              </p>
            </div>
            <div>
              <PaginatedGrid
                data={listingsData}
                entriesPerPage={6}
                columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                renderItem={(item) => (
                  <ListingCard
                    key={item._id}
                    item={item}
                    handleNavigation={() =>
                      navigate(`${item.companyName}`, {
                        state: { companyId: item._id, type: item.type },
                      })
                    }
                  />
                )}
              />
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl h-full">
            {isLisitingLoading ? (
              <SkeletonMap />
            ) : forMapsData?.length ? (
              <Map locations={forMapsData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm border border-dotted rounded-lg">
                Map data not available.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Listings;
