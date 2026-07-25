// MuiModal.js
import React, { useRef } from "react";
import { Modal, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion as Motion } from "motion/react";

const MuiModal = ({
  open,
  onClose,
  title,
  children,
  headerBackground,
}) => {
  const modalRef = useRef(null);

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose}>
          <Motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.1 }}
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center p-4"
            onMouseDown={handleBackdropMouseDown}
          >
            <div
              className="bg-white shadow-xl rounded-lg outline-none w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onMouseDown={(event) => event.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-4 rounded-t-md border-b border-borderGray">
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
              <div className="py-4 px-8">{children}</div>
            </div>
          </Motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default MuiModal;
