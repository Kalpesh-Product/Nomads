import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const PaginatedGrid = ({
  data = [],
  entriesPerPage = 6,
  columns = "grid-cols-1",
  renderItem,
  allowScroll = true,
}) => {
  const localStorageKey = "verticalListingsPage";
  const formData = useSelector((state) => state.location.formValues);
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when category changes
  const prevCategoryRef = useRef(formData?.category || "");
  useEffect(() => {
    const currentCategory = formData?.category || "";
    if (prevCategoryRef.current !== currentCategory) {
      setCurrentPage(1);
      prevCategoryRef.current = currentCategory;
    }
  }, [formData?.category]);

  // ✅ Simple reset on route change
  useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname]);

  const totalPages = Math.ceil(data.length / entriesPerPage);
  const currentData = data.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="flex justify-between flex-col rounded-xl">
      <div className="flex flex-col gap-4 h-full justify-between custom-scrollbar-hide">
        <div className={`grid ${columns} gap-2`}>
          {currentData.length ? (
            currentData.map((item, i) => renderItem(item, i))
          ) : (
            <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
              No items found.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="overflow-x-auto">
          <div className="flex justify-center gap-2 mt-4 w-full px-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const val = index + 1;
              return (
                <button
                  key={val}
                  onClick={() => setCurrentPage(val)}
                  className={`h-8 w-8 flex justify-center items-center rounded-full text-sm transition shrink-0 ${
                    currentPage === val
                      ? "bg-black text-white"
                      : "bg-white text-black border border-gray-300"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedGrid;
