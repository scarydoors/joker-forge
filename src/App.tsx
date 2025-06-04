import { useState } from "react";
import Sidebar from "./components/Sidebar";
import JokersPage from "./components/pages/JokersPage";
import ModMetadataPage from "./components/pages/ModMetadataPage";
import ConsumablesPage from "./components/pages/ConsumablesPage";
import DecksPage from "./components/pages/DecksPage";
import EditionsPage from "./components/pages/EditionsPage";
import EnhancementsPage from "./components/pages/EnhancementsPage";
import DocsPage from "./components/pages/DocsPage";
import VanillaRemadePage from "./components/pages/VanillaRemadePage";
import ExtraCreditPage from "./components/pages/ExtraCreditPage";
import AcknowledgementsPage from "./components/pages/AcknowledgementsPage";
import { JokerData } from "./components/JokerCard";
import { exportJokersAsMod } from "./components/codeGeneration/index";
import { HomeIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";

function App() {
  const [currentSection, setCurrentSection] = useState("overview");
  const [modName, setModName] = useState("My Custom Mod");
  const [authorName, setAuthorName] = useState("Anonymous");
  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    if (!authorName.trim()) {
      alert("Please enter an author name");
      return;
    }

    setExportLoading(true);
    try {
      await exportJokersAsMod(jokers, modName, authorName);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export mod. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewPage jokerCount={jokers.length} />;
      case "metadata":
        return (
          <ModMetadataPage
            modName={modName}
            setModName={setModName}
            authorName={authorName}
            setAuthorName={setAuthorName}
          />
        );
      case "jokers":
        return (
          <JokersPage
            modName={modName}
            jokers={jokers}
            setJokers={setJokers}
            selectedJokerId={selectedJokerId}
            setSelectedJokerId={setSelectedJokerId}
          />
        );
      case "consumables":
        return <ConsumablesPage />;
      case "decks":
        return <DecksPage />;
      case "editions":
        return <EditionsPage />;
      case "enhancements":
        return <EnhancementsPage />;
      case "docs":
        return <DocsPage />;
      case "vanilla":
        return <VanillaRemadePage />;
      case "credit":
        return <ExtraCreditPage />;
      case "acknowledgements":
        return <AcknowledgementsPage />;
      default:
        return <OverviewPage jokerCount={jokers.length} />;
    }
  };

  return (
    <div className="h-screen bg-black-darker flex overflow-hidden">
      <Sidebar
        selectedSection={currentSection}
        onSectionChange={setCurrentSection}
        projectName="mycustommod"
        onExport={handleExport}
        exportLoading={exportLoading}
        jokers={jokers}
        modName={modName}
        authorName={authorName}
      />
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {renderCurrentPage()}
      </div>
    </div>
  );
}

const OverviewPage: React.FC<{ jokerCount: number }> = ({ jokerCount }) => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <HomeIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Project Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white-light font-medium">Project Stats</h3>
            <ChartBarIcon className="h-5 w-5 text-mint" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white-darker text-sm">Jokers</span>
              <span className="text-mint font-bold">{jokerCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white-darker text-sm">Consumables</span>
              <span className="text-mint font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white-darker text-sm">Custom Decks</span>
              <span className="text-mint font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white-darker text-sm">Editions</span>
              <span className="text-mint font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white-darker text-sm">Enhancements</span>
              <span className="text-mint font-bold">0</span>
            </div>
          </div>
        </div>

        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white-light font-medium">Recent Activity</h3>
            <ClockIcon className="h-5 w-5 text-mint" />
          </div>
          <div className="space-y-3">
            <div className="text-white-darker text-sm">No recent activity</div>
          </div>
        </div>

        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h3 className="text-white-light font-medium mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors text-sm cursor-pointer">
              Create New Joker
            </button>
            <button className="w-full text-left px-3 py-2 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors text-sm cursor-pointer">
              Import Existing Mod
            </button>
            <button className="w-full text-left px-3 py-2 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors text-sm cursor-pointer">
              Export Current Project
            </button>
          </div>
        </div>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
        <h2 className="text-xl text-white-light font-light mb-4">
          Welcome to Joker Forge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-mint font-medium mb-3">Getting Started</h3>
            <ul className="space-y-2 text-white-darker text-sm">
              <li>• Create your first custom joker</li>
              <li>• Configure mod metadata</li>
              <li>• Use the Rule Builder for complex effects</li>
              <li>• Export your mod for Balatro</li>
            </ul>
          </div>
          <div>
            <h3 className="text-mint font-medium mb-3">Features</h3>
            <ul className="space-y-2 text-white-darker text-sm">
              <li>• Visual rule builder</li>
              <li>• SMODS code generation</li>
              <li>• Image atlas creation</li>
              <li>• Mod packaging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
