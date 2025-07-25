import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import Button from "./Button";

interface ConfirmationPopupProps {
  isVisible: boolean;
  type?: "default" | "warning" | "danger" | "success";
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isVisible,
  type = "default",
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant,
  icon,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-black-darker",
          border: "border-black",
          icon: icon || <TrashIcon className="h-6 w-6 text-balatro-red" />,
          titleColor: "text-balatro-red",
          contentColor: "text-white-dark",
          defaultConfirmVariant: "danger" as const,
        };
      case "warning":
        return {
          bg: "bg-black-darker",
          border: "border-black",
          icon: icon || (
            <ExclamationTriangleIcon className="h-6 w-6 text-balatro-orange" />
          ),
          titleColor: "text-balatro-orange",
          contentColor: "text-balatro-orange/80",
          defaultConfirmVariant: "primary" as const,
        };
      case "success":
        return {
          bg: "bg-black-darker",
          border: "border-black",
          icon: icon || <CheckCircleIcon className="h-6 w-6 text-mint" />,
          titleColor: "text-mint",
          contentColor: "text-mint/80",
          defaultConfirmVariant: "primary" as const,
        };
      default:
        return {
          bg: "bg-black-darker",
          border: "border-black",
          icon: icon || (
            <QuestionMarkCircleIcon className="h-6 w-6 text-balatro-blue" />
          ),
          titleColor: "text-balatro-blue",
          contentColor: "text-balatro-blue/80",
          defaultConfirmVariant: "primary" as const,
        };
    }
  };

  const typeStyles = getTypeStyles();
  const finalConfirmVariant =
    confirmVariant || typeStyles.defaultConfirmVariant;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black-darker/60 backdrop-blur-sm flex items-center justify-center z-[9999] font-lexend p-4"
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
            className={`
              ${typeStyles.bg} ${typeStyles.border}
              backdrop-blur-md border-2 rounded-xl shadow-2xl
              p-6 min-w-96 max-w-md w-full
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gap-4 mb-6">
              <div className="flex justify-center">{typeStyles.icon}</div>
              <div className="mt-6">
                <h3
                  className={`${typeStyles.titleColor} text-xl text-center tracking-widest mb-4`}
                >
                  {title}
                </h3>
                <p
                  className={`${typeStyles.contentColor} text-center font-medium leading-relaxed`}
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="py-2 px-4">
              <Button
                variant="secondary"
                onClick={onCancel}
                size="md"
                className="w-full mb-6"
              >
                {cancelText}
              </Button>
              <Button
                variant={finalConfirmVariant}
                onClick={onConfirm}
                size="md"
                className="w-full"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationPopup;
