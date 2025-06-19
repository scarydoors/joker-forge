import { useState } from "react";
import Sidebar from "./components/Sidebar";
import OverviewPage from "./components/pages/OverviewPage";
import JokersPage from "./components/pages/JokersPage";
import ModMetadataPage, {
  ModMetadata,
  DEFAULT_MOD_METADATA,
} from "./components/pages/ModMetadataPage";
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
import {
  exportModAsJSON,
  importModFromJSON,
} from "./components/JSONImportExport";
import Alert from "./components/generic/Alert";

interface AlertState {
  isVisible: boolean;
  type: "success" | "warning" | "error";
  title: string;
  content: string;
}

function App() {
  const [currentSection, setCurrentSection] = useState("overview");
  const [modMetadata, setModMetadata] =
    useState<ModMetadata>(DEFAULT_MOD_METADATA);
  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: "success",
    title: "",
    content: "",
  });

  const showAlert = (
    type: "success" | "warning" | "error",
    title: string,
    content: string
  ) => {
    setAlert({
      isVisible: true,
      type,
      title,
      content,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }));
  };

  const handleExport = async () => {
    if (
      !modMetadata.author ||
      modMetadata.author.length === 0 ||
      !modMetadata.author[0].trim()
    ) {
      showAlert(
        "error",
        "Export Failed",
        "Please enter an author name before exporting."
      );
      return;
    }

    if (!modMetadata.name.trim()) {
      showAlert(
        "error",
        "Export Failed",
        "Please enter a mod name before exporting."
      );
      return;
    }

    setExportLoading(true);
    try {
      await exportJokersAsMod(jokers, modMetadata);
      showAlert(
        "success",
        "Export Successful",
        "Your mod files have been exported successfully!"
      );
    } catch (error) {
      console.error("Export failed:", error);
      showAlert(
        "error",
        "Export Failed",
        "Failed to export mod files. Please try again."
      );
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportModAsJSON(modMetadata, jokers);
      showAlert(
        "success",
        "Mod Saved",
        "Your mod has been saved as a JSON file successfully!"
      );
    } catch (error) {
      console.error("JSON export failed:", error);
      showAlert(
        "error",
        "Save Failed",
        "Failed to save mod as JSON. Please try again."
      );
    }
  };

  const handleImportJSON = async () => {
    try {
      const importedData = await importModFromJSON();
      if (importedData) {
        setModMetadata(importedData.metadata);
        setJokers(importedData.jokers);
        setSelectedJokerId(null);
        showAlert(
          "success",
          "Mod Imported",
          "Your mod has been imported successfully!"
        );
      }
    } catch (error) {
      console.error("JSON import failed:", error);
      showAlert(
        "error",
        "Import Failed",
        "Failed to import mod. Please check the file format and try again."
      );
    }
  };

  const handleAddNewJoker = () => {
    const newJoker: JokerData = {
      id: crypto.randomUUID(),
      name: "New Joker",
      description: "A {C:blue}custom{} joker with {C:red}unique{} effects.",
      imagePreview: "",
      rarity: 1,
      cost: 4,
      blueprint_compat: true,
      eternal_compat: true,
      unlocked: true,
      discovered: true,
      rules: [],
    };
    setJokers([...jokers, newJoker]);
    setCurrentSection("jokers");
  };

  const renderCurrentPage = () => {
    switch (currentSection) {
      case "overview":
        return (
          <OverviewPage
            jokerCount={jokers.length}
            jokers={jokers}
            modName={modMetadata.name}
            authorName={modMetadata.author.join(", ")}
            onAddJoker={handleAddNewJoker}
            onExport={handleExport}
            onNavigate={setCurrentSection}
          />
        );
      case "metadata":
        return (
          <ModMetadataPage
            metadata={modMetadata}
            setMetadata={setModMetadata}
          />
        );
      case "jokers":
        return (
          <JokersPage
            modName={modMetadata.name}
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
        return (
          <OverviewPage
            jokerCount={jokers.length}
            jokers={jokers}
            modName={modMetadata.name}
            authorName={modMetadata.author.join(", ")}
            onAddJoker={handleAddNewJoker}
            onExport={handleExport}
            onNavigate={setCurrentSection}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-black-darker flex overflow-hidden">
      <Sidebar
        selectedSection={currentSection}
        onSectionChange={setCurrentSection}
        projectName={modMetadata.id || "mycustommod"}
        onExport={handleExport}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        exportLoading={exportLoading}
        jokers={jokers}
        modName={modMetadata.name}
        authorName={modMetadata.author.join(", ")}
      />
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {renderCurrentPage()}
      </div>

      <Alert
        isVisible={alert.isVisible}
        type={alert.type}
        title={alert.title}
        content={alert.content}
        onClose={hideAlert}
      />
    </div>
  );
}

export default App;
