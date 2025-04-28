import { useState } from "react";
import Background from "./Background";
import JokerCollection from "./components/JokerCollection";
import JokerForm from "./components/JokerForm";
import { JokerData } from "./components/JokerCard";
import { exportJokersAsMod } from "./components/codeGeneration";

function App() {
  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [modName, setModName] = useState("My Custom Mod");

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

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

    // If we're deleting the selected joker, select the first one or null
    if (selectedJokerId === jokerId) {
      const remainingJokers = jokers.filter((joker) => joker.id !== jokerId);
      setSelectedJokerId(
        remainingJokers.length > 0 ? remainingJokers[0].id : null
      );
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = async () => {
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
      setShowExportModal(false);
    }
  };

  const selectedJoker =
    jokers.find((joker) => joker.id === selectedJokerId) || null;

  return (
    <>
      <Background />
      <div id="joker-info-root"></div>

      <div className="min-h-screen font-game text-white overflow-hidden p-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-6xl text-white text-center text-shadow-pixel mb-4">
            Joker Forge
          </h1>

          {/* Mod Name Input */}
          <div className="mx-auto max-w-xs mb-6">
            <label className="block text-white mb-1 text-center">
              Mod Name
            </label>
            <input
              type="text"
              value={modName}
              onChange={(e) => setModName(e.target.value)}
              className="w-full bg-balatro-grey text-white px-3 py-2 text-center pixel-corners-small focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 h-[calc(100vh-220px)]">
            {/* JokerForm */}
            <div className="md:col-span-3 h-full">
              {selectedJoker ? (
                <JokerForm
                  joker={selectedJoker}
                  onSaveJoker={handleSaveJoker}
                  onDeleteJoker={handleDeleteJoker}
                  modName={modName}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-balatro-transparentblack pixel-corners-medium">
                  <p className="text-center text-xl text-balatro-lightgrey p-8">
                    Select a joker from the collection or create a new one to
                    begin editing
                  </p>
                </div>
              )}
            </div>

            {/* JokerCollection */}
            <div className="md:col-span-2 h-full pixel-corners-medium p-6">
              <JokerCollection
                jokers={jokers}
                selectedJokerId={selectedJokerId}
                onSelectJoker={handleSelectJoker}
                onAddNewJoker={handleAddNewJoker}
                modName={modName}
                onExportClick={handleExportClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-balatro-black pixel-corners-medium p-6 max-w-md w-full">
            <h3 className="text-xl text-white text-shadow-pixel mb-4">
              Enter Author Name
            </h3>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small mb-4 focus:outline-none"
            />
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-balatro-red hover:bg-balatro-redshadow text-white py-2 pixel-corners-small transition-colors"
                onClick={() => setShowExportModal(false)}
              >
                <span className="relative z-10 text-shadow-pixel">Cancel</span>
              </button>
              <button
                className="flex-1 bg-balatro-green hover:bg-balatro-greenshadow text-white py-2 pixel-corners-small transition-colors relative"
                onClick={handleExportConfirm}
                disabled={exportLoading}
              >
                <span className="relative z-10 text-shadow-pixel">
                  {exportLoading ? "Exporting..." : "Export"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
