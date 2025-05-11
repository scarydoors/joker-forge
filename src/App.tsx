import { useState } from "react";
import JokerCollection from "./components/JokerCollection";
import JokerForm from "./components/JokerForm";
import { JokerData } from "./components/JokerCard";
import { exportJokersAsMod } from "./components/codeGeneration/index";
import RuleBuilder from "./components/ruleBuilder/RuleBuilder";
import type { Rule } from "./components/ruleBuilder/types";
import InputField from "./components/generic/InputField";
import {
  DocumentTextIcon,
  UserIcon,
  ArrowUpTrayIcon,
  Cog8ToothIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

function App() {
  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [modName, setModName] = useState("My Custom Mod");
  const [authorName, setAuthorName] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [showRuleBuilderModal, setShowRuleBuilderModal] = useState(false);

  const handleSelectJoker = (jokerId: string) => {
    setSelectedJokerId(jokerId);
  };

  const handleAddNewJoker = () => {
    const newJoker: JokerData = {
      id: crypto.randomUUID(),
      name: "New Joker",
      description: "A {C:blue}custom{} joker with {C:red}unique{} effects.",
      chipAddition: 0,
      multAddition: 0,
      xMult: 1,
      imagePreview: "",
      rarity: 1,
      rules: [],
    };
    setJokers([...jokers, newJoker]);
    setSelectedJokerId(newJoker.id);
  };

  const handleSaveJoker = (updatedJoker: JokerData) => {
    setJokers((prev) =>
      prev.map((joker) => (joker.id === updatedJoker.id ? updatedJoker : joker))
    );
  };

  const handleDeleteJoker = (jokerId: string) => {
    setJokers((prev) => prev.filter((joker) => joker.id !== jokerId));

    if (selectedJokerId === jokerId) {
      const remainingJokers = jokers.filter((joker) => joker.id !== jokerId);
      setSelectedJokerId(
        remainingJokers.length > 0 ? remainingJokers[0].id : null
      );
    }
  };

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

  const handleOpenRuleBuilder = () => {
    setShowRuleBuilderModal(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (selectedJoker) {
      const updatedJoker = { ...selectedJoker, rules };
      handleSaveJoker(updatedJoker);
    }
    setShowRuleBuilderModal(false);
  };

  const openGitHub = () => {
    window.open("https://github.com/Jayd-H/joker-forge", "_blank");
  };

  const selectedJoker =
    jokers.find((joker) => joker.id === selectedJokerId) || null;

  return (
    <>
      <div className="min-h-screen bg-black-darker overflow-hidden p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4 flex-1">
              <div className="w-1/2">
                <InputField
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  placeholder="Enter your mod name"
                  separator={true}
                  icon={
                    <DocumentTextIcon className="h-6 w-6 text-mint stroke-2" />
                  }
                  className="h-[42px]"
                />
              </div>
              <div className="w-1/2">
                <InputField
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Author name"
                  separator={true}
                  icon={<UserIcon className="h-6 w-6 text-mint stroke-2" />}
                  className="h-[42px]"
                />
              </div>
            </div>

            <div className="flex bg-black-dark border-2 border-black-light rounded-lg ml-4 h-[42px]">
              <button
                onClick={openGitHub}
                className="px-3 flex items-center justify-center group cursor-pointer"
                title="GitHub Repository"
              >
                <CodeBracketIcon className="h-6 w-6 text-mint stroke-2 group-hover:text-mint-lighter transition-colors" />
              </button>

              <div className="w-px self-stretch my-2 bg-black-light"></div>

              <button
                onClick={handleExport}
                className="px-3 flex items-center justify-center group cursor-pointer"
                title="Export Mod"
                disabled={exportLoading}
              >
                <ArrowUpTrayIcon className="h-6 w-6 text-mint stroke-2 group-hover:text-mint-lighter transition-colors" />
              </button>

              <div className="w-px self-stretch my-2 bg-black-light"></div>

              <button
                className="px-3 flex items-center justify-center group cursor-pointer"
                title="Settings"
              >
                <Cog8ToothIcon className="h-6 w-6 text-mint stroke-2 group-hover:text-mint-lighter transition-colors" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3 h-full">
              {selectedJoker ? (
                <JokerForm
                  joker={selectedJoker}
                  onSaveJoker={handleSaveJoker}
                  onDeleteJoker={handleDeleteJoker}
                  modName={modName}
                  onOpenRuleBuilder={handleOpenRuleBuilder}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white-darker text-xl font-light tracking-wide">
                      No Joker Selected
                    </p>
                    <p className="text-white-darker text-sm mt-2 font-light">
                      Select a joker from the collection or create a new one
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 pl-8">
              <JokerCollection
                jokers={jokers}
                selectedJokerId={selectedJokerId}
                onSelectJoker={handleSelectJoker}
                onAddNewJoker={handleAddNewJoker}
                modName={modName}
                onExportClick={handleExport}
              />
            </div>
          </div>
        </div>
      </div>

      <RuleBuilder
        isOpen={showRuleBuilderModal}
        onClose={() => setShowRuleBuilderModal(false)}
        onSave={handleSaveRules}
        existingRules={selectedJoker?.rules || []}
      />
    </>
  );
}

export default App;
