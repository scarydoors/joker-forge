import { DocumentTextIcon, LinkIcon } from "@heroicons/react/24/outline";

const DocsPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <DocumentTextIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Documentation
        </h1>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-white-darker mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-white-light font-light mb-2">
            Joker Forge Documentation
          </h2>
          <p className="text-white-darker text-sm max-w-md mx-auto mb-6">
            Comprehensive guides, tutorials, and API documentation for creating
            mods with Joker Forge.
          </p>

          <div className="space-y-3 max-w-sm mx-auto">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors">
              <span className="text-sm">Getting Started Guide</span>
              <LinkIcon className="h-4 w-4" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors">
              <span className="text-sm">Rule Builder Tutorial</span>
              <LinkIcon className="h-4 w-4" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors">
              <span className="text-sm">SMODS API Reference</span>
              <LinkIcon className="h-4 w-4" />
            </button>
            <div className="mt-6 inline-block px-4 py-2 bg-mint/20 border border-mint/30 rounded-lg">
              <span className="text-mint text-sm font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
