import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import JokerCard from "../JokerCard";
import EditJokerInfo from "../EditJokerInfo";
import RuleBuilder from "../ruleBuilder/RuleBuilder";
import Button from "../generic/Button";
import { JokerData } from "../JokerCard";
import type { Rule } from "../ruleBuilder/types";

interface JokersPageProps {
  modName: string;
  jokers: JokerData[];
  setJokers: React.Dispatch<React.SetStateAction<JokerData[]>>;
  selectedJokerId: string | null;
  setSelectedJokerId: React.Dispatch<React.SetStateAction<string | null>>;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: JokerData, b: JokerData) => number;
};

const JokersPage: React.FC<JokersPageProps> = ({
  modName,
  jokers,
  setJokers,
  selectedJokerId,
  setSelectedJokerId,
}) => {
  const [editingJoker, setEditingJoker] = useState<JokerData | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentJokerForRules, setCurrentJokerForRules] =
    useState<JokerData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions: SortOption[] = useMemo(
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
        sortFn: (a, b) => a.rarity - b.rarity,
      },
      {
        value: "rarity-desc",
        label: "Rarity (High to Low)",
        sortFn: (a, b) => b.rarity - a.rarity,
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

  const validateJoker = (joker: JokerData) => {
    const issues = [];

    if (!joker.imagePreview) {
      issues.push("Missing image");
    }

    if (!joker.name || joker.name.trim() === "" || joker.name === "New Joker") {
      issues.push("Generic or missing name");
    }

    if (!joker.rules || joker.rules.length === 0) {
      issues.push("No rules defined");
    }

    return issues;
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
    setEditingJoker(newJoker);
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

  const handleDuplicateJoker = (joker: JokerData) => {
    const duplicatedJoker: JokerData = {
      ...joker,
      id: crypto.randomUUID(),
      name: `${joker.name} Copy`,
    };
    setJokers([...jokers, duplicatedJoker]);
  };

  const handleQuickUpdate = (joker: JokerData, updates: Partial<JokerData>) => {
    const updatedJoker = { ...joker, ...updates };
    handleSaveJoker(updatedJoker);
  };

  const handleEditInfo = (joker: JokerData) => {
    setEditingJoker(joker);
  };

  const handleEditRules = (joker: JokerData) => {
    setCurrentJokerForRules(joker);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentJokerForRules) {
      const updatedJoker = { ...currentJokerForRules, rules };
      handleSaveJoker(updatedJoker);
    }
    setShowRuleBuilder(false);
    setCurrentJokerForRules(null);
  };

  const handleUpdateJokerFromRuleBuilder = (updates: Partial<JokerData>) => {
    if (currentJokerForRules) {
      const updatedJoker = { ...currentJokerForRules, ...updates };
      setCurrentJokerForRules(updatedJoker);
      handleSaveJoker(updatedJoker);
    }
  };

  const filteredAndSortedJokers = useMemo(() => {
    const filtered = jokers.filter((joker) => {
      const matchesSearch =
        joker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity =
        rarityFilter === null || joker.rarity === rarityFilter;
      return matchesSearch && matchesRarity;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [jokers, searchTerm, rarityFilter, sortBy, sortOptions]);

  const rarityOptions = [
    { value: null, label: "All Rarities", count: jokers.length },
    {
      value: 1,
      label: "Common",
      count: jokers.filter((j) => j.rarity === 1).length,
    },
    {
      value: 2,
      label: "Uncommon",
      count: jokers.filter((j) => j.rarity === 2).length,
    },
    {
      value: 3,
      label: "Rare",
      count: jokers.filter((j) => j.rarity === 3).length,
    },
    {
      value: 4,
      label: "Legendary",
      count: jokers.filter((j) => j.rarity === 4).length,
    },
  ];

  const validationStats = useMemo(() => {
    const incompleteJokers = jokers.filter(
      (joker) => validateJoker(joker).length > 0
    );
    return {
      total: jokers.length,
      incomplete: incompleteJokers.length,
      complete: jokers.length - incompleteJokers.length,
    };
  }, [jokers]);

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

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Name (A-Z)";

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl text-white-light font-light tracking-wide mb-3 bg-gradient-to-r from-white-light to-mint bg-clip-text text-transparent">
              Jokers
            </h1>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedJokers.length} of {jokers.length}{" "}
                joker{jokers.length !== 1 ? "s" : ""}
              </div>
              {validationStats.incomplete > 0 && (
                <div className="flex items-center text-balatro-orange">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {validationStats.incomplete} incomplete
                </div>
              )}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleAddNewJoker}
            icon={<PlusIcon className="h-5 w-5" />}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            Add New Joker
          </Button>
        </div>

        {/* Search and Filter Panel */}
        <div className="mb-8 bg-gradient-to-r from-black-dark to-black border-2 border-black-lighter rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
              <input
                type="text"
                placeholder="Search jokers by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black-darker border-2 border-black-lighter rounded-xl pl-12 pr-4 py-4 text-white-light placeholder-white-darker focus:outline-none focus:border-mint focus:bg-black transition-all duration-200"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {/* Sort Menu */}
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  icon={<ArrowsUpDownIcon className="h-4 w-4" />}
                  className="whitespace-nowrap"
                >
                  {currentSortLabel}
                </Button>

                {showSortMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl z-20 min-w-56 overflow-hidden">
                    <div className="p-2">
                      <h3 className="text-white-light font-medium text-sm mb-2 px-3 py-1">
                        Sort By
                      </h3>
                      <div className="space-y-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
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
                  </div>
                )}
              </div>

              {/* Filter Menu */}
              <div className="relative">
                <Button
                  variant={showFilters ? "primary" : "secondary"}
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<FunnelIcon className="h-4 w-4" />}
                >
                  Filters
                </Button>

                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl z-10 min-w-52 overflow-hidden">
                    <div className="p-3 border-b border-black-lighter">
                      <h3 className="text-white-light font-medium text-sm mb-3">
                        Filter by Rarity
                      </h3>
                      <div className="space-y-1">
                        {rarityOptions.map((option) => (
                          <button
                            key={option.value || "all"}
                            onClick={() => {
                              setRarityFilter(option.value);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              rarityFilter === option.value
                                ? "bg-mint/20 border border-mint text-mint"
                                : "hover:bg-black-lighter"
                            }`}
                          >
                            <span className={getRarityColor(option.value)}>
                              {option.label}
                            </span>
                            <span className="text-white-darker ml-1">
                              ({option.count})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(searchTerm || rarityFilter !== null) && (
                      <div className="p-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setRarityFilter(null);
                            setShowFilters(false);
                          }}
                          fullWidth
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || rarityFilter !== null) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <div className="flex items-center gap-2 bg-mint/15 border border-mint/40 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
                  <span className="text-mint">Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-mint hover:text-mint-light font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
              {rarityFilter !== null && (
                <div className="flex items-center gap-2 bg-mint/15 border border-mint/40 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
                  <span className="text-mint">
                    Rarity:{" "}
                    {rarityOptions.find((r) => r.value === rarityFilter)?.label}
                  </span>
                  <button
                    onClick={() => setRarityFilter(null)}
                    className="text-mint hover:text-mint-light font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        {filteredAndSortedJokers.length === 0 && jokers.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="bg-gradient-to-br from-black-dark to-black border-2 border-black-lighter rounded-2xl p-8 max-w-md shadow-lg">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Jokers Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No jokers match your current search and filter criteria. Try
                adjusting your filters or search terms.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm("");
                  setRarityFilter(null);
                }}
                fullWidth
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        ) : filteredAndSortedJokers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="bg-gradient-to-br from-black-dark to-black border-2 border-black-lighter rounded-2xl p-8 max-w-md shadow-lg">
              <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Jokers Yet
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Get started by creating your first custom joker. You can define
                its appearance, stats, and unique gameplay effects.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewJoker}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Joker
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {filteredAndSortedJokers.map((joker) => (
              <JokerCard
                key={joker.id}
                joker={joker}
                onEditInfo={() => handleEditInfo(joker)}
                onEditRules={() => handleEditRules(joker)}
                onDelete={() => handleDeleteJoker(joker.id)}
                onDuplicate={() => handleDuplicateJoker(joker)}
                onQuickUpdate={(updates) => handleQuickUpdate(joker, updates)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {editingJoker && (
          <EditJokerInfo
            isOpen={!!editingJoker}
            joker={editingJoker}
            onClose={() => setEditingJoker(null)}
            onSave={handleSaveJoker}
            onDelete={handleDeleteJoker}
          />
        )}

        {showRuleBuilder && currentJokerForRules && (
          <RuleBuilder
            isOpen={showRuleBuilder}
            onClose={() => {
              setShowRuleBuilder(false);
              setCurrentJokerForRules(null);
            }}
            onSave={handleSaveRules}
            existingRules={currentJokerForRules.rules || []}
            joker={currentJokerForRules}
            onUpdateJoker={handleUpdateJokerFromRuleBuilder}
          />
        )}
      </div>
    </div>
  );
};

export default JokersPage;
