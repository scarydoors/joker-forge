import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

interface RestoreProgressModalProps {
  isVisible: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  getAutoSaveMetadata: () => { timestamp: number; daysOld: number } | null;
}

const RestoreProgressModal: React.FC<RestoreProgressModalProps> = ({
  isVisible,
  onRestore,
  onDiscard,
  getAutoSaveMetadata,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onDiscard();
    }
  };

  const getTimeDescription = () => {
    const metadata = getAutoSaveMetadata();
    if (!metadata) return "recently";
    if (metadata.daysOld < 1) return "today";
    if (metadata.daysOld < 2) return "yesterday";
    return `${Math.floor(metadata.daysOld)} days ago`;
  };

  const formatTimestamp = () => {
    const metadata = getAutoSaveMetadata();
    if (!metadata) return "";

    const date = new Date(metadata.timestamp);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
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
            className="bg-black-dark border-2 border-black-lighter rounded-xl shadow-2xl min-w-96 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b bg-black-darker border-black-lighter/50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 bg-mint/20 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-mint" />
                </div>
                <div>
                  <h2 className="text-xl text-white-light font-medium tracking-wide">
                    Restore Auto-Saved Project?
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-white-darker">
                      Saved {formatTimestamp()}
                    </p>
                    <span className="px-2 py-0.5 bg-mint/20 border border-mint/30 rounded text-xs text-mint font-medium">
                      {getTimeDescription()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={onRestore}
                  size="md"
                  className="w-full"
                >
                  Restore Project
                </Button>
                <Button
                  variant="secondary"
                  onClick={onDiscard}
                  size="md"
                  className="w-full"
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestoreProgressModal;
