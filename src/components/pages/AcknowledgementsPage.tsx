import { HeartIcon } from "@heroicons/react/24/outline";

const AcknowledgementsPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <HeartIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Acknowledgements
        </h1>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
        <div className="space-y-6">
          <div className="text-center">
            <HeartIcon className="h-16 w-16 text-mint mx-auto mb-4" />
            <h2 className="text-xl text-white-light font-light mb-2">
              Special Thanks
            </h2>
            <p className="text-white-darker text-sm max-w-md mx-auto"></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
              <h3 className="text-mint font-medium mb-2">SMODS Team</h3>
              <p className="text-white-darker text-sm"></p>
            </div>

            <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
              <h3 className="text-mint font-medium mb-2">LocalThunk</h3>
              <p className="text-white-darker text-sm"></p>
            </div>

            <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
              <h3 className="text-mint font-medium mb-2">Heroicons</h3>
              <p className="text-white-darker text-sm"></p>
            </div>

            <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
              <h3 className="text-mint font-medium mb-2">Community</h3>
              <p className="text-white-darker text-sm"></p>
            </div>
          </div>
        </div>
        <span className="text-mint text-sm font-medium">WIP </span>
      </div>
    </div>
  );
};

export default AcknowledgementsPage;
