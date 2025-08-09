import React from "react";
import {
  CheckCircleIcon,
  FolderIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Modal from "./Modal";
import Button from "./Button";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mod Exported Successfully!"
      icon={<CheckCircleIcon className="h-6 w-6 text-mint" />}
      maxWidth="max-w-3xl"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-mint/10 border border-mint/30 rounded-lg">
          <FolderIcon className="h-5 w-5 text-mint flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-mint font-medium mb-2">
              Installation Instructions
            </h4>
            <p className="text-sm text-white-light leading-tight mb-2">
              To use your custom mod, place the exported folder in:
            </p>
            <code className="bg-black-dark px-2 py-1 rounded text-mint-lighter font-mono text-sm block mb-2">
              %appdata%\Roaming\Balatro\Mods
            </code>
            <p className="text-sm text-white-dark leading-tight">
              Make sure you have{" "}
              <a
                href="https://github.com/Steamodded/smods"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint-light hover:text-mint-lighter hover:underline font-medium"
              >
                SMODS (Steamodded)
              </a>{" "}
              installed as well.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-balatro-blue/10 border border-balatro-blue/30 rounded-lg">
          <BookOpenIcon className="h-5 w-5 text-balatro-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-balatro-blue font-medium mb-2">
              Learn More About Modding
            </h4>
            <p className="text-sm text-white-light leading-relaxed mb-3">
              Want to learn about modding Balatro? Check out these resources:
            </p>
            <div className="space-y-2">
              <a
                href="https://github.com/nh6574/VanillaRemade/wiki"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-balatro-blue hover:text-blue-300 hover:underline font-medium text-sm"
              >
                → Vanilla Remade Wiki by N'
              </a>
              <a
                href="https://github.com/Steamodded/smods/wiki"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-balatro-blue hover:text-blue-300 hover:underline font-medium text-sm"
              >
                → SMODS Official Wiki
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-balatro-orange/10 border border-balatro-orange/30 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 text-balatro-orange flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-balatro-orange font-medium mb-2">
              Found a Bug or Have Suggestions?
            </h4>
            <p className="text-sm text-white-light leading-relaxed">
              If you encounter any issues with the generated code or have ideas
              for improvements, please{" "}
              <a
                href="https://github.com/Jayd-H/joker-forge/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-balatro-orange hover:text-orange-300 hover:underline font-medium"
              >
                open an issue on GitHub
              </a>
              . Your feedback helps make Joker Forge better!
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            Awesome!
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
