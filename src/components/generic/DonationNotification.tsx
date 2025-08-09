import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

interface DonationNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onDonate: () => void;
  onDismissTemporarily: () => void;
}

const DonationNotification: React.FC<DonationNotificationProps> = ({
  isVisible,
  onDonate,
  onDismissTemporarily,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="fixed top-6 right-6 z-[9998] font-lexend"
        >
          <div className=" max-w-xs">
            <div className="mb-3">
              <h4 className="text-white-light font-medium text-sm text-center tracking-wide">
                Enjoying Joker Forge?
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onDonate}
                className="w-full"
                icon={<HeartIcon className="h-4 w-4" />}
              >
                Support on Ko-fi
              </Button>

              <button
                onClick={onDismissTemporarily}
                className="text-white-darker hover:text-white-light text-xs text-center py-1 transition-colors cursor-pointer"
              >
                Don't show again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationNotification;
