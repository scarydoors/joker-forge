import { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PuzzlePieceIcon,
  SwatchIcon,
  CheckCircleIcon,
  FolderIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Pages
import Sidebar from "./components/Sidebar";
import OverviewPage from "./components/pages/OverviewPage";
import JokersPage from "./components/pages/JokersPage";
import ModMetadataPage, {
  ModMetadata,
  DEFAULT_MOD_METADATA,
} from "./components/pages/ModMetadataPage";
import RaritiesPage from "./components/pages/RaritiesPage";
import ConsumablesPage from "./components/pages/ConsumablesPage";
import DecksPage from "./components/pages/DecksPage";
import EditionsPage from "./components/pages/EditionsPage";
import VanillaRemadePage from "./components/pages/VanillaReforgedPage";
import AcknowledgementsPage from "./components/pages/AcknowledgementsPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import BoostersPage from "./components/pages/BoostersPage";
import EnhancementsPage from "./components/pages/EnhancementsPage";

// Data and Utils
import {
  ConsumableData,
  JokerData,
  RarityData,
  ConsumableSetData,
  BoosterData,
  updateDataRegistry,
  EnhancementData,
} from "./components/data/BalatroUtils";
import { exportModCode } from "./components/codeGeneration/entry";
import {
  exportModAsJSON,
  importModFromJSON,
} from "./components/JSONImportExport";
import Alert from "./components/generic/Alert";
import ConfirmationPopup from "./components/generic/ConfirmationPopup";
import Modal from "./components/generic/Modal";
import Button from "./components/generic/Button";

interface AlertState {
  isVisible: boolean;
  type: "success" | "warning" | "error";
  title: string;
  content: string;
}

interface ConfirmationState {
  isVisible: boolean;
  type: "default" | "warning" | "danger" | "success";
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AutoSaveData {
  modMetadata: ModMetadata;
  jokers: JokerData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  boosters: BoosterData[];
  enhancements: EnhancementData[];
  timestamp: number;
}

const AUTO_SAVE_KEY = "joker-forge-autosave";

const FloatingTabDock: React.FC<{
  activeTab: "jokers" | "rarities";
  onTabChange: (tab: "jokers" | "rarities") => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "jokers" as const,
      icon: PuzzlePieceIcon,
      label: "Jokers",
    },
    {
      id: "rarities" as const,
      icon: SwatchIcon,
      label: "Rarities",
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black-dark border-2 border-black-lighter rounded-full px-3 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative group p-3 rounded-full transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-mint/20 border-2 border-mint text-mint scale-110"
                      : "bg-black-darker/50 border-2 border-black-lighter text-white-darker hover:border-mint hover:text-mint hover:scale-105"
                  }
                `}
                title={tab.label}
              >
                <Icon className="h-5 w-5" />

                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black-darker border border-black-lighter rounded-lg px-2 py-1 whitespace-nowrap">
                    <span className="text-white-light text-xs font-medium">
                      {tab.label}
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black-lighter"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentSection = location.pathname.slice(1) || "overview";
  const isExpanded = currentSection === "overview" || currentSection === "";

  const [boosters, setBoosters] = useState<BoosterData[]>([]);
  const [selectedBoosterId, setSelectedBoosterId] = useState<string | null>(
    null
  );

  const [modMetadata, setModMetadata] =
    useState<ModMetadata>(DEFAULT_MOD_METADATA);

  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [consumables, setConsumables] = useState<ConsumableData[]>([]);
  const [customRarities, setCustomRarities] = useState<RarityData[]>([]);
  const [consumableSets, setConsumableSets] = useState<ConsumableSetData[]>([]);
  const [enhancements, setEnhancements] = useState<EnhancementData[]>([]);
  const [selectedEnhancementId, setSelectedEnhancementId] = useState<
    string | null
  >(null);

  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [selectedConsumableId, setSelectedConsumableId] = useState<
    string | null
  >(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: "success",
    title: "",
    content: "",
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isVisible: false,
    type: "default",
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [showExportSuccessModal, setShowExportSuccessModal] = useState(false);
  const [jokersRaritiesTab, setJokersRaritiesTab] = useState<
    "jokers" | "rarities"
  >("jokers");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<{
    modMetadata: ModMetadata;
    jokers: JokerData[];
    consumables: ConsumableData[];
    customRarities: RarityData[];
    consumableSets: ConsumableSetData[];
    boosters: BoosterData[];
    enhancements: EnhancementData[];
  } | null>(null);

  // Show confirmation function
  const showConfirmation = useCallback(
    (options: {
      type?: "default" | "warning" | "danger" | "success";
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: "primary" | "secondary" | "danger";
      icon?: React.ReactNode;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setConfirmation({
        isVisible: true,
        type: options.type || "default",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        confirmVariant: options.confirmVariant,
        icon: options.icon,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
    },
    []
  );

  // Hide confirmation function
  const hideConfirmation = useCallback(() => {
    setConfirmation((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Handle confirmation confirm
  const handleConfirm = () => {
    confirmation.onConfirm();
    hideConfirmation();
  };

  // Handle confirmation cancel
  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  const saveToLocalStorage = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[]
    ) => {
      try {
        const data: AutoSaveData = {
          modMetadata: metadata,
          jokers: jokerData,
          consumables: consumableData,
          customRarities: raritiesData,
          consumableSets: setsData,
          boosters: boosterData,
          enhancements: enhancementsData,
          timestamp: Date.now(),
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        console.log("Auto-saved project state");
      } catch (error) {
        console.warn("Failed to auto-save:", error);
      }
    },
    []
  );

  useEffect(() => {
    updateDataRegistry(
      customRarities,
      consumableSets,
      consumables,
      boosters,
      enhancements,
      modMetadata.prefix || ""
    );
  }, [
    customRarities,
    consumableSets,
    consumables,
    boosters,
    enhancements,
    modMetadata.prefix,
  ]);

  const loadFromLocalStorage = useCallback((): {
    modMetadata: ModMetadata;
    jokers: JokerData[];
    consumables: ConsumableData[];
    customRarities: RarityData[];
    consumableSets: ConsumableSetData[];
    boosters: BoosterData[];
    enhancements: EnhancementData[];
  } | null => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      if (!savedData) return null;

      const data: AutoSaveData = JSON.parse(savedData);

      if (!data.modMetadata || !Array.isArray(data.jokers)) {
        console.warn("Invalid auto-save data structure");
        localStorage.removeItem(AUTO_SAVE_KEY);
        return null;
      }

      console.log("Loaded auto-saved project state");
      return {
        modMetadata: data.modMetadata,
        jokers: data.jokers,
        consumables: data.consumables || [],
        customRarities: data.customRarities || [],
        consumableSets: data.consumableSets || [],
        boosters: data.boosters || [],
        enhancements: data.enhancements || [],
      };
    } catch (error) {
      console.warn("Failed to load auto-save:", error);
      localStorage.removeItem(AUTO_SAVE_KEY);
      return null;
    }
  }, []);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
      console.log("Cleared auto-save data");
    } catch (error) {
      console.warn("Failed to clear auto-save:", error);
    }
  }, []);

  const getAutoSaveMetadata = useCallback((): {
    timestamp: number;
    daysOld: number;
  } | null => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      if (!savedData) return null;

      const data: AutoSaveData = JSON.parse(savedData);
      const daysOld = (Date.now() - data.timestamp) / (24 * 60 * 60 * 1000);

      return {
        timestamp: data.timestamp,
        daysOld: Math.floor(daysOld * 10) / 10,
      };
    } catch {
      return null;
    }
  }, []);

  const hasDataChanged = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[]
    ) => {
      if (!prevDataRef.current) return true;

      const prevData = prevDataRef.current;
      return (
        JSON.stringify(prevData.modMetadata) !== JSON.stringify(metadata) ||
        JSON.stringify(prevData.jokers) !== JSON.stringify(jokerData) ||
        JSON.stringify(prevData.consumables) !==
          JSON.stringify(consumableData) ||
        JSON.stringify(prevData.customRarities) !==
          JSON.stringify(raritiesData) ||
        JSON.stringify(prevData.consumableSets) !== JSON.stringify(setsData) ||
        JSON.stringify(prevData.boosters) !== JSON.stringify(boosterData) ||
        JSON.stringify(prevData.enhancements) !==
          JSON.stringify(enhancementsData)
      );
    },
    []
  );

  const isDataDifferentFromDefaults = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[]
    ) => {
      if (
        jokerData.length > 0 ||
        consumableData.length > 0 ||
        raritiesData.length > 0 ||
        setsData.length > 0 ||
        boosterData.length > 0 ||
        enhancementsData.length > 0
      )
        return true;

      const defaultMetadata = DEFAULT_MOD_METADATA;

      const significantFields: (keyof ModMetadata)[] = [
        "name",
        "author",
        "description",
        "id",
        "prefix",
      ];

      for (const field of significantFields) {
        if (
          JSON.stringify(metadata[field]) !==
          JSON.stringify(defaultMetadata[field])
        ) {
          return true;
        }
      }

      return false;
    },
    []
  );

  const debouncedSave = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[]
    ) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage(
          metadata,
          jokerData,
          consumableData,
          raritiesData,
          setsData,
          boosterData,
          enhancementsData
        );
      }, 500);
    },
    [saveToLocalStorage]
  );

  useEffect(() => {
    const loadAutoSave = () => {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setShowRestoreModal(true);
      }
      setHasLoadedInitialData(true);
    };

    loadAutoSave();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (!hasLoadedInitialData) return;

    if (
      !isDataDifferentFromDefaults(
        modMetadata,
        jokers,
        consumables,
        customRarities,
        consumableSets,
        boosters,
        enhancements
      )
    )
      return;

    if (
      !hasDataChanged(
        modMetadata,
        jokers,
        consumables,
        customRarities,
        consumableSets,
        boosters,
        enhancements
      )
    )
      return;

    prevDataRef.current = {
      modMetadata,
      jokers,
      consumables,
      customRarities,
      consumableSets,
      boosters,
      enhancements,
    };

    setAutoSaveStatus("saving");

    debouncedSave(
      modMetadata,
      jokers,
      consumables,
      customRarities,
      consumableSets,
      boosters,
      enhancements
    );

    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    if (clearStatusTimeoutRef.current) {
      clearTimeout(clearStatusTimeoutRef.current);
    }

    statusTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus("saved");
    }, 400);

    clearStatusTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus("idle");
    }, 1000);

    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }
    };
  }, [
    modMetadata,
    jokers,
    consumables,
    customRarities,
    consumableSets,
    boosters,
    enhancements,
    hasLoadedInitialData,
    debouncedSave,
    hasDataChanged,
    isDataDifferentFromDefaults,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }
    };
  }, []);

  const handleRestoreAutoSave = () => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setModMetadata(savedData.modMetadata);
      setJokers(savedData.jokers);
      setConsumables(savedData.consumables);
      setCustomRarities(savedData.customRarities);
      setConsumableSets(savedData.consumableSets);
      setBoosters(savedData.boosters);
      setEnhancements(savedData.enhancements);
      setSelectedJokerId(null);
      setSelectedConsumableId(null);
      setSelectedBoosterId(null);
      setSelectedEnhancementId(null);
      prevDataRef.current = {
        modMetadata: savedData.modMetadata,
        jokers: savedData.jokers,
        consumables: savedData.consumables,
        customRarities: savedData.customRarities,
        consumableSets: savedData.consumableSets,
        boosters: savedData.boosters,
        enhancements: savedData.enhancements,
      };
      showAlert(
        "success",
        "Project Restored",
        "Your auto-saved project has been restored successfully!"
      );
    }
    setShowRestoreModal(false);
  };

  const handleDiscardAutoSave = () => {
    clearAutoSave();
    setShowRestoreModal(false);
  };

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

  const handleNavigate = (section: string) => {
    navigate(`/${section}`);
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
      await exportModCode(
        jokers,
        consumables,
        modMetadata,
        customRarities,
        consumableSets,
        boosters,
        enhancements
      );
      setShowExportSuccessModal(true);
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
      exportModAsJSON(
        modMetadata,
        jokers,
        customRarities,
        consumables,
        consumableSets,
        boosters,
        enhancements
      );
      showAlert(
        "success",
        "Mod Saved",
        "Your mod has been saved as a jokerforge file!"
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
        setConsumables(importedData.consumables);
        setCustomRarities(importedData.customRarities);
        setConsumableSets(importedData.consumableSets);
        setBoosters(importedData.boosters);
        setEnhancements(importedData.enhancements || []);
        setSelectedJokerId(null);
        setSelectedConsumableId(null);
        setSelectedBoosterId(null);
        setSelectedEnhancementId(null);
        prevDataRef.current = {
          modMetadata: importedData.metadata,
          jokers: importedData.jokers,
          consumables: importedData.consumables,
          customRarities: importedData.customRarities,
          consumableSets: importedData.consumableSets,
          boosters: importedData.boosters,
          enhancements: importedData.enhancements || [],
        };
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

  const showFloatingDock = currentSection === "jokers";

  return (
    <div className="h-screen bg-black-darker flex overflow-hidden">
      <Sidebar
        selectedSection={currentSection}
        onSectionChange={handleNavigate}
        projectName={modMetadata.id || "mycustommod"}
        onExport={handleExport}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        exportLoading={exportLoading}
        jokers={jokers}
        modName={modMetadata.name}
        authorName={modMetadata.author.join(", ")}
      />
      <motion.div
        className="flex-1 flex flex-col overflow-y-auto custom-scrollbar"
        animate={{
          marginLeft: isExpanded ? 0 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                jokerCount={jokers.length}
                jokers={jokers}
                modName={modMetadata.name}
                authorName={modMetadata.author.join(", ")}
                metadata={modMetadata}
                setMetadata={setModMetadata}
                onExport={handleExport}
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/overview"
            element={
              <OverviewPage
                jokerCount={jokers.length}
                jokers={jokers}
                modName={modMetadata.name}
                authorName={modMetadata.author.join(", ")}
                metadata={modMetadata}
                setMetadata={setModMetadata}
                onExport={handleExport}
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/metadata"
            element={
              <ModMetadataPage
                metadata={modMetadata}
                setMetadata={setModMetadata}
              />
            }
          />
          <Route
            path="/jokers"
            element={
              <>
                {jokersRaritiesTab === "jokers" ? (
                  <JokersPage
                    modName={modMetadata.name}
                    jokers={jokers}
                    setJokers={setJokers}
                    selectedJokerId={selectedJokerId}
                    setSelectedJokerId={setSelectedJokerId}
                    customRarities={customRarities}
                    modPrefix={modMetadata.prefix || ""}
                    showConfirmation={showConfirmation}
                  />
                ) : (
                  <RaritiesPage
                    modName={modMetadata.name}
                    rarities={customRarities}
                    setRarities={setCustomRarities}
                    showConfirmation={showConfirmation}
                  />
                )}
              </>
            }
          />
          <Route
            path="/consumables"
            element={
              <ConsumablesPage
                modName={modMetadata.name}
                consumables={consumables}
                setConsumables={setConsumables}
                selectedConsumableId={selectedConsumableId}
                setSelectedConsumableId={setSelectedConsumableId}
                modPrefix={modMetadata.prefix || ""}
                consumableSets={consumableSets}
                setConsumableSets={setConsumableSets}
                showConfirmation={showConfirmation}
              />
            }
          />
          <Route
            path="/boosters"
            element={
              <BoostersPage
                modName={modMetadata.name}
                boosters={boosters}
                setBoosters={setBoosters}
                selectedBoosterId={selectedBoosterId}
                setSelectedBoosterId={setSelectedBoosterId}
                modPrefix={modMetadata.prefix || ""}
                showConfirmation={showConfirmation}
                consumableSets={consumableSets}
              />
            }
          />
          <Route
            path="/enhancements"
            element={
              <EnhancementsPage
                modName={modMetadata.name}
                enhancements={enhancements}
                setEnhancements={setEnhancements}
                selectedEnhancementId={selectedEnhancementId}
                setSelectedEnhancementId={setSelectedEnhancementId}
                modPrefix={modMetadata.prefix || ""}
                showConfirmation={showConfirmation}
              />
            }
          />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/editions" element={<EditionsPage />} />
          <Route
            path="/vanilla"
            element={
              <VanillaRemadePage
                onDuplicateToProject={(item, type) => {
                  if (type === "joker") {
                    setJokers([...jokers, item as JokerData]);
                  } else if (type === "consumable") {
                    setConsumables([...consumables, item as ConsumableData]);
                  } else if (type === "booster") {
                    setBoosters([...boosters, item as BoosterData]);
                  }
                }}
                onNavigateToJokers={() => {
                  navigate("/jokers");
                }}
                onNavigateToConsumables={() => {
                  navigate("/consumables");
                }}
                onNavigateToBoosters={() => {
                  navigate("/boosters");
                }}
              />
            }
          />
          <Route path="/acknowledgements" element={<AcknowledgementsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>

      {showFloatingDock && (
        <FloatingTabDock
          activeTab={jokersRaritiesTab}
          onTabChange={setJokersRaritiesTab}
        />
      )}

      <AnimatePresence>
        {autoSaveStatus !== "idle" && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                autoSaveStatus === "saving"
                  ? "bg-mint-darker text-white-light border border-mint-dark"
                  : "bg-mint-light text-black-dark border border-mint-lighter"
              }`}
            >
              {autoSaveStatus === "saving" ? "Auto-saving..." : "Auto-saved"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black-dark border-2 border-black-lighter rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-white-light text-lg font-medium tracking-widest mb-4">
              Restore Auto-Saved Project?
            </h3>
            <p className="text-white-dark tracking-wide text-sm mb-6">
              We found an auto-saved version of your project from{" "}
              {(() => {
                const metadata = getAutoSaveMetadata();
                if (!metadata) return "recently";
                if (metadata.daysOld < 1) return "today";
                if (metadata.daysOld < 2) return "yesterday";
                return `${Math.floor(metadata.daysOld)} days ago`;
              })()}{" "}
              Would you like to restore it?
            </p>
            <div className="flex gap-4">
              <Button
                color="primary"
                variant="primary"
                onClick={handleRestoreAutoSave}
                className="w-full"
              >
                Restore
              </Button>
              <Button
                color="secondary"
                variant="secondary"
                className="w-full"
                onClick={handleDiscardAutoSave}
              >
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showExportSuccessModal}
        onClose={() => setShowExportSuccessModal(false)}
        title="Mod Exported Successfully!"
        icon={<CheckCircleIcon className="h-6 w-6 text-mint" />}
        maxWidth="max-w-2xl"
        buttons={[
          {
            label: "Okay!",
            onClick: () => setShowExportSuccessModal(false),
            variant: "primary",
          },
        ]}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-mint/10 border border-mint/30 rounded-lg">
            <FolderIcon className="h-5 w-5 text-mint flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-mint font-medium mb-2">
                Installation Instructions
              </h4>
              <p className="text-sm text-white-light leading-relaxed">
                To use your custom mod, place the exported folder in:
              </p>
              <code className="bg-black-dark px-2 py-1 rounded text-mint-lighter font-mono">
                %appdata%\Roaming\Balatro\Mods
              </code>
              <p className="text-sm text-white-dark mt-2">
                Make sure you have{" "}
                <a
                  href="https://github.com/Steamodded/smods"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint-light hover:text-mint-lighter hover:underline"
                >
                  SMODS (Steamodded)
                </a>{" "}
                installed as well.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-balatro-orange/10 border border-balatro-orange/30 rounded-lg">
            <ExclamationCircleIcon className="h-5 w-5 text-balatro-orange flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-balatro-orange font-medium mb-2">
                Found a Bug or Have Suggestions?
              </h4>
              <p className="text-sm text-white-light leading-relaxed">
                If you encounter any issues with the generated code or have
                ideas for improvements, please{" "}
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
        </div>
      </Modal>

      <Alert
        isVisible={alert.isVisible}
        type={alert.type}
        title={alert.title}
        content={alert.content}
        onClose={hideAlert}
      />

      <ConfirmationPopup
        isVisible={confirmation.isVisible}
        type={confirmation.type}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        confirmVariant={confirmation.confirmVariant}
        icon={confirmation.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
