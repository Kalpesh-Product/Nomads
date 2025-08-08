import React, { useState, useEffect } from "react";

const PaginatedGrid = ({
  data = [],
  entriesPerPage = 6,
  columns = "grid-cols-1",
  renderItem,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1); // reset to page 1 on data change
  }, [data]);

  const totalPages = Math.ceil(data.length / entriesPerPage);
  const currentData = data.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const getPageButtons = () => {
    const buttons = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        buttons.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return buttons;
  };

  return (
    <div className="flex flex-col gap-4 min-h-[65vh] overflow-y-auto max-h-screen justify-between custom-scrollbar-hide">
      <div className={`grid ${columns} gap-2`}>
        {currentData.length ? (
          currentData.map((item, i) => renderItem(item, i))
        ) : (
          <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
            No items found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {/* {getPageButtons().map((val, i) =>
            val === "..." ? (
              <span key={i} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={val}
                onClick={() => setCurrentPage(val)}
                className={`h-8 w-8 flex justify-center items-center rounded-full text-sm transition ${
                  currentPage === val
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300"
                }`}>
                {val}
              </button>
            )
          )} */}

          <div className="overflow-x-auto">
            <div className="flex justify-start gap-2 mt-4 w-max px-2">
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
        </div>
      )}
    </div>
  );
};

export default PaginatedGrid;
