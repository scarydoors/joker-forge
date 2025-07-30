import React, { useState, useMemo, useEffect, startTransition } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  StarIcon,
  LockOpenIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  NoSymbolIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { JokerData } from "../data/BalatroUtils";
import { ConsumableData } from "../data/BalatroUtils";
import { formatBalatroText } from "../generic/balatroTextFormatter";
import RuleBuilder from "../ruleBuilder/RuleBuilder";
import Button from "../generic/Button";
import Tooltip from "../generic/Tooltip";

interface VanillaReforgedPageProps {
  onDuplicateToProject?: (
    item: JokerData | ConsumableData,
    type: "joker" | "consumable"
  ) => void;
  onNavigateToJokers?: () => void;
  onNavigateToConsumables?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (
    a: JokerData | ConsumableData,
    b: JokerData | ConsumableData
  ) => number;
};

const useAsyncDataLoader = () => {
  const [vanillaJokers, setVanillaJokers] = useState<JokerData[]>([]);
  const [vanillaConsumables, setVanillaConsumables] = useState<
    ConsumableData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/vanillareforged.json");
        if (!response.ok) {
          throw new Error("Failed to fetch vanilla data");
        }

        const data = await response.json();

        if (!isCancelled) {
          startTransition(() => {
            setVanillaJokers(data.jokers || []);
            setVanillaConsumables(data.consumables || []);
            setLoading(false);
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching vanilla data:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          setVanillaJokers([]);
          setVanillaConsumables([]);
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadData, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { vanillaJokers, vanillaConsumables, loading, error };
};

const FloatingTabDock: React.FC<{
  activeTab: "jokers" | "consumables";
  onTabChange: (tab: "jokers" | "consumables") => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "jokers" as const,
      icon: DocumentTextIcon,
      label: "Jokers",
    },
    {
      id: "consumables" as const,
      icon: CakeIcon,
      label: "Consumables",
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

const VanillaReforgedPage: React.FC<VanillaReforgedPageProps> = ({
  onDuplicateToProject,
  onNavigateToJokers,
  onNavigateToConsumables,
}) => {
  const { vanillaJokers, vanillaConsumables, loading } = useAsyncDataLoader();
  const [activeTab, setActiveTab] = useState<"jokers" | "consumables">(
    "jokers"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [setFilter, setSetFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentItemForRules, setCurrentItemForRules] = useState<
    JokerData | ConsumableData | null
  >(null);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [filtersMenuPosition, setFiltersMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const filtersButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const filtersMenuRef = React.useRef<HTMLDivElement>(null);

  const jokerSortOptions: SortOption[] = useMemo(
    () => [
      {
        value: "name-asc",
        label: "Name (A-Z)",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        value: "name-desc",
        label: "Name (Z-A)",
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      {
        value: "rarity-asc",
        label: "Rarity (Low to High)",
        sortFn: (a, b) => {
          const aNum =
            typeof (a as JokerData).rarity === "number"
              ? (a as JokerData).rarity
              : 999;
          const bNum =
            typeof (b as JokerData).rarity === "number"
              ? (b as JokerData).rarity
              : 999;
          return Number(aNum) - Number(bNum);
        },
      },
      {
        value: "rarity-desc",
        label: "Rarity (High to Low)",
        sortFn: (a, b) => {
          const aNum =
            typeof (a as JokerData).rarity === "number"
              ? (a as JokerData).rarity
              : 999;
          const bNum =
            typeof (b as JokerData).rarity === "number"
              ? (b as JokerData).rarity
              : 999;
          return Number(bNum) - Number(aNum);
        },
      },
      {
        value: "cost-asc",
        label: "Cost (Low to High)",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
      },
      {
        value: "cost-desc",
        label: "Cost (High to Low)",
        sortFn: (a, b) => (b.cost || 0) - (a.cost || 0),
      },
      {
        value: "rules-desc",
        label: "Rules (Most to Least)",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
      },
      {
        value: "rules-asc",
        label: "Rules (Least to Most)",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
      },
    ],
    []
  );

  const consumableSortOptions: SortOption[] = useMemo(
    () => [
      {
        value: "name-asc",
        label: "Name (A-Z)",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        value: "name-desc",
        label: "Name (Z-A)",
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      {
        value: "set-asc",
        label: "Set (A-Z)",
        sortFn: (a, b) =>
          (a as ConsumableData).set.localeCompare((b as ConsumableData).set),
      },
      {
        value: "set-desc",
        label: "Set (Z-A)",
        sortFn: (a, b) =>
          (b as ConsumableData).set.localeCompare((a as ConsumableData).set),
      },
      {
        value: "cost-asc",
        label: "Cost (Low to High)",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
      },
      {
        value: "cost-desc",
        label: "Cost (High to Low)",
        sortFn: (a, b) => (b.cost || 0) - (a.cost || 0),
      },
      {
        value: "rules-desc",
        label: "Rules (Most to Least)",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
      },
      {
        value: "rules-asc",
        label: "Rules (Least to Most)",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
      },
    ],
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node) &&
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
      if (
        filtersButtonRef.current &&
        !filtersButtonRef.current.contains(event.target as Node) &&
        filtersMenuRef.current &&
        !filtersMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSortMenu && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
        width: 224,
      });
    }
  }, [showSortMenu]);

  useEffect(() => {
    if (showFilters && filtersButtonRef.current) {
      const rect = filtersButtonRef.current.getBoundingClientRect();
      setFiltersMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 256,
        width: 256,
      });
    }
  }, [showFilters]);

  const currentData =
    activeTab === "jokers" ? vanillaJokers : vanillaConsumables;
  const currentSortOptions =
    activeTab === "jokers" ? jokerSortOptions : consumableSortOptions;

  const filteredAndSortedItems = useMemo(() => {
    if (loading || !currentData.length) return [];

    const filtered = currentData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (activeTab === "jokers") {
        const joker = item as JokerData;
        matchesFilter = rarityFilter === null || joker.rarity === rarityFilter;
      } else {
        const consumable = item as ConsumableData;
        matchesFilter = setFilter === null || consumable.set === setFilter;
      }

      return matchesSearch && matchesFilter;
    });

    const currentSort = currentSortOptions.find(
      (option) => option.value === sortBy
    );
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [
    currentData,
    searchTerm,
    rarityFilter,
    setFilter,
    sortBy,
    currentSortOptions,
    loading,
    activeTab,
  ]);

  const rarityOptions = useMemo(
    () => [
      { value: null, label: "All Rarities", count: vanillaJokers.length },
      {
        value: 1,
        label: "Common",
        count: vanillaJokers.filter((j) => j.rarity === 1).length,
      },
      {
        value: 2,
        label: "Uncommon",
        count: vanillaJokers.filter((j) => j.rarity === 2).length,
      },
      {
        value: 3,
        label: "Rare",
        count: vanillaJokers.filter((j) => j.rarity === 3).length,
      },
      {
        value: 4,
        label: "Legendary",
        count: vanillaJokers.filter((j) => j.rarity === 4).length,
      },
    ],
    [vanillaJokers]
  );

  const setOptions = useMemo(
    () => [
      { value: null, label: "All Sets", count: vanillaConsumables.length },
      {
        value: "Tarot",
        label: "Tarot",
        count: vanillaConsumables.filter((c) => c.set === "Tarot").length,
      },
      {
        value: "Planet",
        label: "Planet",
        count: vanillaConsumables.filter((c) => c.set === "Planet").length,
      },
      {
        value: "Spectral",
        label: "Spectral",
        count: vanillaConsumables.filter((c) => c.set === "Spectral").length,
      },
    ],
    [vanillaConsumables]
  );

  const handleDuplicateItem = (item: JokerData | ConsumableData) => {
    if (onDuplicateToProject) {
      const duplicatedItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} Copy`,
      };
      onDuplicateToProject(
        duplicatedItem,
        activeTab === "jokers" ? "joker" : "consumable"
      );

      if (activeTab === "jokers" && onNavigateToJokers) {
        onNavigateToJokers();
      } else if (activeTab === "consumables" && onNavigateToConsumables) {
        onNavigateToConsumables();
      }
    }
  };

  const handleViewRules = (item: JokerData | ConsumableData) => {
    if (item.rules && item.rules.length === 1) {
      item.rules[0].position = { x: 500, y: 100 };
    }
    setCurrentItemForRules(item);
    setShowRuleBuilder(true);
  };

  const handleCloseRuleBuilder = () => {
    setShowRuleBuilder(false);
    setCurrentItemForRules(null);
  };

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFilters) setShowFilters(false);
    setShowSortMenu(!showSortMenu);
  };

  const handleFiltersToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showSortMenu) setShowSortMenu(false);
    setShowFilters(!showFilters);
  };

  const getRarityColor = (rarity: number | null) => {
    switch (rarity) {
      case 1:
        return "text-balatro-blue";
      case 2:
        return "text-balatro-green";
      case 3:
        return "text-balatro-red";
      case 4:
        return "text-balatro-purple";
      default:
        return "text-white-light";
    }
  };

  const getSetColor = (set: string | null) => {
    switch (set) {
      case "Tarot":
        return "text-balatro-purple";
      case "Planet":
        return "text-balatro-blue";
      case "Spectral":
        return "text-balatro-spectral";
      default:
        return "text-white-light";
    }
  };

  const currentSortLabel =
    currentSortOptions.find((option) => option.value === sortBy)?.label ||
    "Name (A-Z)";

  const filterKey = `${searchTerm}-${rarityFilter}-${setFilter}-${sortBy}-${activeTab}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.98,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.4,
        delay: index < 10 ? index * 0.05 : 0,
      },
    }),
  };

  const staticVariants = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Vanilla Reforged
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          Reference Collection
        </h1>

        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                Vanilla Collection •{" "}
                {loading
                  ? "Loading..."
                  : `${filteredAndSortedItems.length} of ${currentData.length}`}{" "}
                {activeTab === "jokers" ? "joker" : "consumable"}
                {currentData.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
              <input
                type="text"
                placeholder={`Search vanilla ${activeTab} by name or description...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black-darker shadow-2xl border-2 border-black-lighter rounded-lg pl-12 pr-4 py-4 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={handleSortMenuToggle}
                  className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
                >
                  <ArrowsUpDownIcon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{currentSortLabel}</span>
                </button>
              </div>

              <div className="relative">
                <button
                  ref={filtersButtonRef}
                  onClick={handleFiltersToggle}
                  className={`flex items-center gap-2 px-4 py-4 border-2 rounded-lg transition-colors cursor-pointer ${
                    showFilters
                      ? "bg-mint-dark text-black-darker border-mint"
                      : "bg-black-dark text-white-light border-black-lighter hover:border-mint"
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <div className="animate-spin h-16 w-16 border-4 border-mint border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-white-light text-xl font-light mb-3">
                  Loading Vanilla{" "}
                  {activeTab === "jokers" ? "Jokers" : "Consumables"}
                </h3>
                <p className="text-white-darker text-sm leading-relaxed">
                  Fetching the complete vanilla {activeTab} collection...
                </p>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 && currentData.length > 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No {activeTab === "jokers" ? "Jokers" : "Consumables"} Found
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  No vanilla {activeTab} match your current search and filter
                  criteria. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setRarityFilter(null);
                    setSetFilter(null);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 ? (
            <motion.div
              key="no-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No Vanilla {activeTab === "jokers" ? "Jokers" : "Consumables"}{" "}
                  Available
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  Unable to load the vanilla {activeTab} collection. Please try
                  refreshing the page.
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  fullWidth
                >
                  Refresh Page
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`content-${filterKey}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid lg:grid-cols-2 md:grid-cols-1 gap-14"
            >
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={index < 10 ? itemVariants : staticVariants}
                  initial={index < 10 ? "hidden" : "visible"}
                  animate="visible"
                  custom={index}
                >
                  {activeTab === "jokers" ? (
                    <VanillaJokerCard
                      joker={item as JokerData}
                      onDuplicate={() => handleDuplicateItem(item)}
                      onViewRules={() => handleViewRules(item)}
                    />
                  ) : (
                    <VanillaConsumableCard
                      consumable={item as ConsumableData}
                      onDuplicate={() => handleDuplicateItem(item)}
                      onViewRules={() => handleViewRules(item)}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingTabDock activeTab={activeTab} onTabChange={setActiveTab} />

        {showRuleBuilder && currentItemForRules && (
          <RuleBuilder
            isOpen={showRuleBuilder}
            onClose={handleCloseRuleBuilder}
            onSave={() => {}}
            existingRules={currentItemForRules.rules || []}
            item={currentItemForRules}
            onUpdateItem={() => {}}
            itemType={activeTab === "jokers" ? "joker" : "consumable"}
          />
        )}
      </div>

      {showSortMenu &&
        ReactDOM.createPortal(
          <div
            ref={sortMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${sortMenuPosition.top}px`,
              left: `${sortMenuPosition.left}px`,
              width: `${sortMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-2">
              <h3 className="text-white-light font-medium text-sm mb-2 px-3 py-1">
                Sort By
              </h3>
              <div className="space-y-1">
                {currentSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      sortBy === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter text-white-darker hover:text-white-light"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {showFilters &&
        ReactDOM.createPortal(
          <div
            ref={filtersMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${filtersMenuPosition.top}px`,
              left: `${filtersMenuPosition.left}px`,
              width: `${filtersMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-3 border-b border-black-lighter">
              <h3 className="text-white-light font-medium text-sm mb-3">
                Filter by {activeTab === "jokers" ? "Rarity" : "Set"}
              </h3>
              <div className="space-y-1">
                {(activeTab === "jokers" ? rarityOptions : setOptions).map(
                  (option) => (
                    <button
                      key={option.value || "all"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTab === "jokers") {
                          setRarityFilter(option.value as number | null);
                        } else {
                          setSetFilter(option.value as string | null);
                        }
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        (activeTab === "jokers" ? rarityFilter : setFilter) ===
                        option.value
                          ? "bg-mint/20 border border-mint text-mint"
                          : "hover:bg-black-lighter"
                      }`}
                    >
                      <span
                        className={
                          activeTab === "jokers"
                            ? getRarityColor(option.value as number | null)
                            : getSetColor(option.value as string | null)
                        }
                      >
                        {option.label}
                      </span>
                      <span className="text-white-darker ml-1">
                        ({option.count})
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {(searchTerm ||
              (activeTab === "jokers"
                ? rarityFilter !== null
                : setFilter !== null)) && (
              <div className="p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    setRarityFilter(null);
                    setSetFilter(null);
                    setShowFilters(false);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

interface VanillaJokerCardProps {
  joker: JokerData;
  onDuplicate: () => void;
  onViewRules: () => void;
}

interface VanillaConsumableCardProps {
  consumable: ConsumableData;
  onDuplicate: () => void;
  onViewRules: () => void;
}

const PropertyIcon: React.FC<{
  icon: React.ReactNode;
  tooltip: string;
  variant: "disabled" | "warning" | "success" | "info" | "special";
  isEnabled: boolean;
}> = ({ icon, tooltip, variant, isEnabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    disabled: isEnabled
      ? "bg-black-dark border-black-lighter text-white-darker"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    warning: isEnabled
      ? "bg-balatro-orange/20 border-balatro-orange/40 text-balatro-orange"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    success: isEnabled
      ? "bg-balatro-green/20 border-balatro-green/40 text-balatro-green"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    info: isEnabled
      ? "bg-balatro-blue/20 border-balatro-blue/40 text-balatro-blue"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    special: isEnabled
      ? "bg-balatro-purple/20 border-balatro-purple/40 text-balatro-purple"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
  };

  return (
    <Tooltip content={tooltip} show={isHovered}>
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all duration-200 ${variantStyles[variant]}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-4 h-4">{icon}</div>
      </div>
    </Tooltip>
  );
};

const VanillaJokerCard: React.FC<VanillaJokerCardProps> = ({
  joker,
  onDuplicate,
  onViewRules,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const safeRarity =
    typeof joker.rarity === "number" && joker.rarity >= 1 && joker.rarity <= 4
      ? joker.rarity
      : 1;

  const getRarityText = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      1: "Common",
      2: "Uncommon",
      3: "Rare",
      4: "Legendary",
    };
    return rarityMap[rarity] || "Common";
  };

  const getRarityStyles = (rarity: number) => {
    const styleMap: Record<
      number,
      { text: string; bg: string; border: string }
    > = {
      1: {
        text: "text-balatro-blue",
        bg: "bg-black",
        border: "border-balatro-blue",
      },
      2: {
        text: "text-balatro-green",
        bg: "bg-black",
        border: "border-balatro-green",
      },
      3: {
        text: "text-balatro-red",
        bg: "bg-black",
        border: "border-balatro-red",
      },
      4: {
        text: "text-balatro-purple",
        bg: "bg-black",
        border: "border-balatro-purple",
      },
    };
    return styleMap[rarity] || styleMap[1];
  };

  const rarityText = getRarityText(safeRarity);
  const rarityStyles = getRarityStyles(safeRarity);
  const rulesCount = joker.rules?.length || 0;

  const blueprintCompat = joker.blueprint_compat !== false;
  const eternalCompat = joker.eternal_compat !== false;
  const isUnlocked = joker.unlocked !== false;
  const isDiscovered = joker.discovered !== false;
  const forceEternal = joker.force_eternal === true;
  const forcePerishable = joker.force_perishable === true;
  const forceRental = joker.force_rental === true;
  const appearsInShop = joker.appears_in_shop !== false;

  const propertyIcons = [
    {
      icon: <DocumentTextIcon className="w-full h-full" />,
      tooltip: blueprintCompat
        ? "Blueprint Compatible"
        : "Cannot be copied by Blueprint",
      variant: "disabled" as const,
      isEnabled: blueprintCompat,
    },
    {
      icon: <StarIcon className="w-full h-full" />,
      tooltip: eternalCompat ? "Eternal Compatible" : "Cannot be made Eternal",
      variant: "disabled" as const,
      isEnabled: eternalCompat,
    },
    {
      icon: isUnlocked ? (
        <LockOpenIcon className="w-full h-full" />
      ) : (
        <LockClosedIcon className="w-full h-full" />
      ),
      tooltip: isUnlocked ? "Unlocked by Default" : "Locked by Default",
      variant: "warning" as const,
      isEnabled: isUnlocked,
    },
    {
      icon: isDiscovered ? (
        <EyeIcon className="w-full h-full" />
      ) : (
        <EyeSlashIcon className="w-full h-full" />
      ),
      tooltip: isDiscovered ? "Visible in Collection" : "Hidden in Collection",
      variant: "info" as const,
      isEnabled: isDiscovered,
    },
    {
      icon: <ExclamationCircleIcon className="w-full h-full" />,
      tooltip: forceEternal
        ? "Always Spawns Eternal"
        : "Normal Eternal Spawning",
      variant: "special" as const,
      isEnabled: forceEternal,
    },
    {
      icon: <ClockIcon className="w-full h-full" />,
      tooltip: forcePerishable
        ? "Always Spawns Perishable"
        : "Normal Perishable Spawning",
      variant: "warning" as const,
      isEnabled: forcePerishable,
    },
    {
      icon: <CurrencyDollarIcon className="w-full h-full" />,
      tooltip: forceRental ? "Always Spawns Rental" : "Normal Rental Spawning",
      variant: "info" as const,
      isEnabled: forceRental,
    },
    {
      icon: appearsInShop ? (
        <BuildingStorefrontIcon className="w-full h-full" />
      ) : (
        <NoSymbolIcon className="w-full h-full" />
      ),
      tooltip: appearsInShop
        ? joker.rarity === 4
          ? "Forced Shop Appearance"
          : "Appears in Shop"
        : "Doesn't Appear in Shop",
      variant:
        appearsInShop && joker.rarity === 4
          ? ("special" as const)
          : ("success" as const),
      isEnabled: appearsInShop,
    },
  ];

  const handleButtonHover = (buttonType: string) => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredButton(buttonType);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleButtonLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredButton(null);
  };

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-md border-2 font-bold transition-all bg-black tracking-widest border-balatro-money text-balatro-money w-18 text-center">
          ${joker.cost || 4}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative">
            {joker.imagePreview && !imageLoadError ? (
              <>
                <img
                  src={joker.imagePreview}
                  alt={joker.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {joker.overlayImagePreview && (
                  <img
                    src={joker.overlayImagePreview}
                    alt={`${joker.name} overlay`}
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable="false"
                  />
                )}
              </>
            ) : (
              <img
                src={
                  !fallbackAttempted
                    ? "/images/placeholderjokers/placeholder-joker.png"
                    : "/images/placeholder-joker.png"
                }
                alt="Default Joker"
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => {
                  if (!fallbackAttempted) {
                    setFallbackAttempted(true);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div
            className={`px-6 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium transition-all ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.text}`}
          >
            {rarityText}
          </div>
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
              <h3
                className="text-white-lighter text-xl tracking-wide leading-tight line-clamp-1"
                style={{ lineHeight: "1.75rem" }}
              >
                {joker.name}
              </h3>
            </div>

            <div className="mb-4 h-12 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(joker.description),
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 h-8 flex-wrap">
              {propertyIcons.map((iconConfig, index) => (
                <PropertyIcon
                  key={index}
                  icon={iconConfig.icon}
                  tooltip={iconConfig.tooltip}
                  variant={iconConfig.variant}
                  isEnabled={iconConfig.isEnabled}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center px-12 justify-between overflow-hidden">
            <Tooltip
              content="Duplicate to Project"
              show={hoveredButton === "duplicate"}
            >
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onDuplicate}
                onMouseEnter={() => handleButtonHover("duplicate")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <DocumentDuplicateIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="View Rules" show={hoveredButton === "rules"}>
              <div
                className="flex flex-1 hover:text-mint-light transition-colors cursor-pointer group"
                onClick={onViewRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <PuzzlePieceIcon className="h-6 w-6 group-hover:text-mint-lighter text-white transition-colors" />
                    {rulesCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-mint text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {rulesCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

const VanillaConsumableCard: React.FC<VanillaConsumableCardProps> = ({
  consumable,
  onDuplicate,
  onViewRules,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const getConsumableSetColor = (set: string): string => {
    switch (set) {
      case "Tarot":
        return "#b26cbb";
      case "Planet":
        return "#13afce";
      case "Spectral":
        return "#4584fa";
      default:
        return "#666666";
    }
  };

  const rulesCount = consumable.rules?.length || 0;
  const isUnlocked = consumable.unlocked !== false;
  const isDiscovered = consumable.discovered !== false;
  const isHidden = consumable.hidden === true;

  const propertyIcons = [
    {
      icon: isUnlocked ? (
        <LockOpenIcon className="w-full h-full" />
      ) : (
        <LockClosedIcon className="w-full h-full" />
      ),
      tooltip: isUnlocked ? "Unlocked by Default" : "Locked by Default",
      variant: "warning" as const,
      isEnabled: isUnlocked,
    },
    {
      icon: isDiscovered ? (
        <EyeIcon className="w-full h-full" />
      ) : (
        <EyeSlashIcon className="w-full h-full" />
      ),
      tooltip: isDiscovered ? "Visible in Collection" : "Hidden in Collection",
      variant: "info" as const,
      isEnabled: isDiscovered,
    },
    {
      icon: <ExclamationCircleIcon className="w-full h-full" />,
      tooltip: isHidden ? "Hidden Consumable" : "Normal Consumable",
      variant: "special" as const,
      isEnabled: isHidden,
    },
  ];

  const handleButtonHover = (buttonType: string) => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredButton(buttonType);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleButtonLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredButton(null);
  };

  const setColor = getConsumableSetColor(consumable.set);

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-md border-2 font-bold transition-all bg-black tracking-widest border-balatro-money text-balatro-money w-18 text-center">
          ${consumable.cost || 3}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative">
            {consumable.imagePreview && !imageLoadError ? (
              <>
                <img
                  src={consumable.imagePreview}
                  alt={consumable.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {consumable.overlayImagePreview && (
                  <img
                    src={consumable.overlayImagePreview}
                    alt={`${consumable.name} overlay`}
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable="false"
                  />
                )}
              </>
            ) : (
              <img
                src={
                  !fallbackAttempted
                    ? "/images/placeholderjokers/placeholder-joker.png"
                    : "/images/placeholder-joker.png"
                }
                alt="Default Consumable"
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => {
                  if (!fallbackAttempted) {
                    setFallbackAttempted(true);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div
            className="px-6 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium transition-all bg-black"
            style={{
              borderColor: setColor,
              color: setColor,
            }}
          >
            {consumable.set}
          </div>
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
              <h3
                className="text-white-lighter text-xl tracking-wide leading-tight line-clamp-1"
                style={{ lineHeight: "1.75rem" }}
              >
                {consumable.name}
              </h3>
            </div>

            <div className="mb-4 h-12 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(consumable.description),
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 px-12 h-8 flex-wrap">
              {propertyIcons.map((iconConfig, index) => (
                <PropertyIcon
                  key={index}
                  icon={iconConfig.icon}
                  tooltip={iconConfig.tooltip}
                  variant={iconConfig.variant}
                  isEnabled={iconConfig.isEnabled}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center px-12 justify-between overflow-hidden">
            <Tooltip
              content="Duplicate to Project"
              show={hoveredButton === "duplicate"}
            >
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onDuplicate}
                onMouseEnter={() => handleButtonHover("duplicate")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <DocumentDuplicateIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="View Rules" show={hoveredButton === "rules"}>
              <div
                className="flex flex-1 hover:text-mint-light transition-colors cursor-pointer group"
                onClick={onViewRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <PuzzlePieceIcon className="h-6 w-6 group-hover:text-mint-lighter text-white transition-colors" />
                    {rulesCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-mint text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {rulesCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanillaReforgedPage;
