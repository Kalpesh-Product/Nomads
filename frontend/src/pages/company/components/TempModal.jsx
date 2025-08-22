import React, { useRef } from "react";
import { Modal, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const TempModal = ({
  open,
  onClose,
  title,
  children,
  headerBackground,
  bgColor="bg-black",
  width="100%",
  padding="p-4",
  height="100%"
}) => {
  const modalRef = useRef(null);

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose}>
          <div
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center  overflow-hidden"
          >
            <motion.div
              key="modal"
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${bgColor} ${height} ${width}  shadow-xl outline-none overflow-y-auto rounded-xl`}
            >
              {/* Header */}
       

              {/* Content */}
              <div className={`${padding}`}>{children}</div>
            </motion.div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default TempModal;
