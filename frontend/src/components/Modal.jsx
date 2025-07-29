// MuiModal.js
import React, { useRef } from "react";
import { Modal, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";

const MuiModal = ({
  open,
  onClose,
  title,
  children,
  headerBackground,
  height = "90vh",   
  width = "90vw",
  color
}) => {
  const modalRef = useRef(null);

  return (
    <Modal open={open} onClose={onClose}>
      <div
        ref={modalRef}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <div className="bg-white shadow-xl rounded-lg outline-none w-full max-w-4xl max-h-[100vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 rounded-t-md border-b border-borderGray">
            <div className="text-title w-full text-center text-black">
              {title}
            </div>
            <IconButton sx={{ p: 0 }} onClick={onClose}>
              <IoMdClose
                className="text-white"
                style={{ color: headerBackground ? "white" : "black" }}
              />
            </IconButton>
          </div>

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </Modal>
  );
};

export default MuiModal;
