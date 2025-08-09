import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

interface AlertProps {
  isVisible: boolean;
  type: "success" | "warning" | "error";
  title: string;
  content: string;
  duration?: number;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({
  isVisible,
  type,
  title,
  content,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-black-dark",
          border: "border-mint/40",
          icon: <CheckCircleIcon className="h-6 w-6 text-mint" />,
          titleColor: "text-mint",
          contentColor: "text-mint/80",
        };
      case "warning":
        return {
          bg: "bg-black-dark",
          border: "border-balatro-orange/40",
          icon: (
            <ExclamationTriangleIcon className="h-6 w-6 text-balatro-orange" />
          ),
          titleColor: "text-balatro-orange",
          contentColor: "text-balatro-orange/80",
        };
      case "error":
        return {
          bg: "bg-black-dark",
          border: "border-balatro-red/40",
          icon: <XCircleIcon className="h-6 w-6 text-balatro-red" />,
          titleColor: "text-balatro-red",
          contentColor: "text-balatro-red/80",
        };
      default:
        return {
          bg: "bg-black-dark",
          border: "border-mint/40",
          icon: <CheckCircleIcon className="h-6 w-6 text-mint" />,
          titleColor: "text-mint",
          contentColor: "text-mint/80",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9999] font-lexend"
        >
          <div
            className={`
              ${typeStyles.bg} ${typeStyles.border}
              border-2 rounded-xl shadow-2xl
              p-4 min-w-80 max-w-md
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{typeStyles.icon}</div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`${typeStyles.titleColor} font-medium text-sm tracking-wide mb-1`}
                >
                  {title}
                </h4>
                <p
                  className={`${typeStyles.contentColor} text-sm leading-relaxed`}
                >
                  {content}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
