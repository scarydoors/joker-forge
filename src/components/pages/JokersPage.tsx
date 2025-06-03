import JokerCollection from "../JokerCollection";
import JokerForm from "../JokerForm";
import { JokerData } from "../JokerCard";
import { exportJokersAsMod } from "../codeGeneration/index";

interface JokersPageProps {
  modName: string;
  authorName: string;
  jokers: JokerData[];
  setJokers: React.Dispatch<React.SetStateAction<JokerData[]>>;
  selectedJokerId: string | null;
  setSelectedJokerId: React.Dispatch<React.SetStateAction<string | null>>;
}

const JokersPage: React.FC<JokersPageProps> = ({
  modName,
  authorName,
  jokers,
  setJokers,
  selectedJokerId,
  setSelectedJokerId,
}) => {
  const handleSelectJoker = (jokerId: string) => {
    setSelectedJokerId(jokerId);
  };

  const handleAddNewJoker = () => {
    const newJoker: JokerData = {
      id: crypto.randomUUID(),
      name: "New Joker",
      description: "A {C:blue}custom{} joker with {C:red}unique{} effects.",
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
    await exportJokersAsMod(jokers, modName, authorName);
    alert("Failed to export mod. Please try again.");
  };

  const selectedJoker =
    jokers.find((joker) => joker.id === selectedJokerId) || null;

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        {selectedJoker ? (
          <JokerForm
            joker={selectedJoker}
            onSaveJoker={handleSaveJoker}
            onDeleteJoker={handleDeleteJoker}
            modName={modName}
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
      <div className="w-80 border-l border-black-lighter">
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
  );
};

export default JokersPage;
