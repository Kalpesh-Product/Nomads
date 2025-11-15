import React, { useRef } from "react";
import { Modal } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const TempModal = ({
  open,
  onClose,
  children,
  bgColor = "bg-black",
  width = "w-full", // keep full, we’ll clamp via prop on usage
}) => {
  const modalRef = useRef(null);

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose}>
          {/* Backdrop container */}
          <div
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            {/* Panel */}
            <motion.div
              key="modal"
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${bgColor} ${width} shadow-xl outline-none rounded-xl
                         w-full lg:w-[70vw] max-h-[90vh] overflow-y-auto overscroll-contain`}
              style={{ WebkitOverflowScrolling: "touch" }} // smooth iOS scroll
            >
              <div className="p-0">{children}</div>
            </motion.div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default TempModal;
