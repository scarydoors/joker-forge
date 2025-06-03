import { FolderIcon } from "@heroicons/react/24/outline";

export const VanillaRemadePage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <FolderIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Vanilla Remade
        </h1>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-white-darker mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-white-light font-light mb-2">
            Vanilla Remade Collection
          </h2>
          <p className="text-white-darker text-sm max-w-md mx-auto mb-6">
            Browse and import jokers from the popular Vanilla Remade mod to use
            as starting points for your own creations.
          </p>

          <div className="mt-6 inline-block px-4 py-2 bg-mint/20 border border-mint/30 rounded-lg">
            <span className="text-mint text-sm font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanillaRemadePage;
