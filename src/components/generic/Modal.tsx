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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-lexend"
          onClick={handleBackdropClick}
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
            className={`bg-black-dark border-2 border-black-lighter rounded-xl shadow-2xl ${maxWidth} w-full overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b bg-black-darker border-black-lighter/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="flex-shrink-0 p-2 bg-black-darker rounded-lg">
                      {icon}
                    </div>
                  )}
                  <h2 className="text-xl text-white-light font-medium tracking-wide">
                    {title}
                  </h2>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-white-darker hover:text-white-light hover:bg-black-lighter rounded-lg transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="text-white-light leading-relaxed">{children}</div>
            </div>

            {/* Footer */}
            {buttons.length > 0 && (
              <div className="px-6 py-4 border-t border-black-lighter/50 bg-black-darker/30">
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
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
