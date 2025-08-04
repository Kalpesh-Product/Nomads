import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { NavLink, useNavigate } from "react-router-dom";
import Map from "../components/Map";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axios.js";
import renderStars from "../utils/renderStarts.jsx";
import SkeletonCard from "../components/Skeletons/SkeletonCard.jsx";
import SkeletonMap from "../components/Skeletons/SkeletonMap.jsx";
import Select from "react-dropdown-select";
import { setFormValues } from "../features/locationSlice.js";
import ListingCard from "../components/ListingCard.jsx";
import newIcons from "../assets/newIcons.js";

const GlobalListings = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.location.formValues);
  const countryOptions = [{ label: "India", value: "india" }];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const categoryOptions = [
    { label: "Co-Working", value: "coworking" },
    { label: "Co-Living", value: "coliving" },
  ];
  console.log("formData", formData);
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `common/location-and-type-based-company-data?country=${country}&state=${location}`
      );

      // return response.data;
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!formData?.country && !!formData?.location, // ✅ prevents fetching on empty state
  });

  const groupedListings = listingsData?.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeLabels = {
    coworking: "Co-Working Spaces",
    coliving: "Co-Living Spaces",
    // fallback for unknown types
    default: (type) => `${type[0].toUpperCase() + type.slice(1)} Spaces`,
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  const { handleSubmit, control, reset, setValue, getValues } = useForm({
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
    <div className="flex flex-col gap-8 ">
      <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
        <Container padding={false}>
          <div className="flex flex-col gap-4 justify-between w-3/4 md:w-3/4 lg:w-full h-full">
            <form
              onSubmit={handleSubmit((data) => locationData(data))}
              className="flex flex-col gap-4"
            >
              <div className=" w-full flex justify-center items-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryOptions.map((cat) => {
                    const iconSrc = newIcons[cat.value];

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryClick(cat.value)}
                        className=" text-primary-blue  px-4 py-2   hover:text-black transition flex items-center justify-center w-fit"
                      >
                        {iconSrc ? (
                          <div className="h-10 w-full flex flex-col gap-0">
                            <img
                              src={iconSrc}
                              alt={cat.label}
                              className="h-full w-full object-contain"
                            />
                            <span className="text-sm">{cat.label}</span>
                          </div>
                        ) : (
                          cat.label // fallback if no icon found
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 border-2 border-primary-blue rounded-full pl-4 h-10 lg:h-16 justify-between items-center bg-white">
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
                        onChange={(values) => field.onChange(values[0]?.value)}
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
                    className="h-full text-center w-full flex justify-center items-center text-white"
                  >
                    <CiSearch className="text-lg" /> &nbsp; Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Container>
      </div>
      <hr />
      <Container padding={false}>
        <div className="">
          <div className="font-semibold text-lg">
            <div className="pr-10 h-[36rem] overflow-y-auto overflow-x-hidden">
              {isLisitingLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : groupedListings && Object.keys(groupedListings).length > 0 ? (
                Object.entries(groupedListings).map(([type, items]) => {
                  const displayItems = items.slice(0, 5);
                  const showViewMore = items.length > 5;
                  const sectionTitle = `Popular ${
                    typeLabels[type] || typeLabels.default(type)
                  } in ${formData?.location}`;

                  return (
                    <div key={type} className="col-span-full mb-6">
                      <h2 className="text-subtitle font-semibold mb-5">
                        {sectionTitle}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                        {displayItems.map((item) => (
                          <ListingCard key={item._id} item={item} />
                        ))}
                      </div>

                      {showViewMore && (
                        <div className="mt-3">
                          <NavLink
                            to={`/nomads/${formData.country}.${formData.location}/${type}`}
                            state={{ ...formData, category: type }}
                            className="text-primary-blue text-sm font-semibold hover:underline"
                          >
                            View More{" "}
                            {typeLabels[type] || typeLabels.default(type)} →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
                  No listings found.
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GlobalListings;
