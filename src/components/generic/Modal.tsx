import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: ModalButton[];
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  maxWidth?: string;
  icon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  buttons = [],
  showCloseButton = true,
  maxWidth = "max-w-lg",
  icon,
}) => {
  const getButtonStyles = (variant: string = "primary") => {
    switch (variant) {
      case "primary":
        return "bg-mint text-black-dark hover:bg-mint-light font-medium px-6 py-3 rounded-lg transition-colors cursor-pointer";
      case "secondary":
        return "bg-black-lighter text-white-light hover:bg-black-light px-6 py-3 rounded-lg transition-colors cursor-pointer";
      case "danger":
        return "bg-balatro-red text-white hover:bg-balatro-redshadow px-6 py-3 rounded-lg transition-colors cursor-pointer";
      default:
        return "bg-mint text-black-dark hover:bg-mint-light font-medium px-6 py-3 rounded-lg transition-colors cursor-pointer";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-lexend"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={`bg-black-dark border-2 border-black-lighter rounded-xl shadow-2xl ${maxWidth} w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                  <h2 className="text-xl text-white-light font-medium tracking-wide">
                    {title}
                  </h2>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-white-darker hover:text-white-light transition-colors p-1 cursor-pointer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="mb-6 text-white-light leading-relaxed">
                {children}
              </div>

              {buttons.length > 0 && (
                <div className="flex gap-3 justify-end">
                  {buttons.map((button, index) => (
                    <button
                      key={index}
                      onClick={button.onClick}
                      className={`flex items-center gap-2 ${getButtonStyles(
                        button.variant
                      )}`}
                    >
                      {button.icon && <span>{button.icon}</span>}
                      <span>{button.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
