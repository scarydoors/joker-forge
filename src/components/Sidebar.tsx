import React, { useState } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  RectangleStackIcon,
  SparklesIcon,
  FolderIcon,
  HeartIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  CodeBracketIcon,
  CakeIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";
import { JokerData } from "./JokerCard";

interface SidebarProps {
  selectedSection?: string;
  onSectionChange?: (section: string) => void;
  projectName?: string;
  onExport?: () => Promise<void>;
  exportLoading?: boolean;
  jokers?: JokerData[];
  modName?: string;
  authorName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSection = "overview",
  onSectionChange,
  projectName = "mycustommod",
  onExport,
  exportLoading = false,
  jokers = [],
}) => {
  const [activeSection, setActiveSection] = useState(selectedSection);

  const handleSectionClick = (section: string) => {
    if (section === "github") {
      window.open("https://github.com/Jayd-H/joker-forge", "_blank");
      return;
    }

    setActiveSection(section);
    onSectionChange?.(section);
  };

  const handleExport = async () => {
    if (onExport) {
      await onExport();
    }
  };

  const navigationItems = [
    { id: "overview", label: "Overview", icon: HomeIcon },
    { id: "metadata", label: "Mod Metadata", icon: DocumentTextIcon },
    { id: "jokers", label: "Jokers", icon: PuzzlePieceIcon },
    { id: "consumables", label: "Consumables", icon: CakeIcon },
    { id: "decks", label: "Decks", icon: RectangleStackIcon },
    { id: "editions", label: "Editions", icon: SparklesIcon },
    { id: "enhancements", label: "Enhancements", icon: LightBulbIcon },
  ];

  const resourceItems = [
    { id: "docs", label: "Docs", icon: DocumentTextIcon },
    { id: "vanilla", label: "Vanilla Remade", icon: FolderIcon },
    { id: "credit", label: "Extra Credit", icon: FolderIcon },
    { id: "github", label: "GitHub Repository", icon: FolderIcon },
    { id: "acknowledgements", label: "Acknowledgements", icon: HeartIcon },
  ];

  return (
    <div className="w-80 bg-black-dark border-r-2 border-black-light flex flex-col font-lexend">
      <div className="p-6 border-black-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-mint-light rounded-lg flex items-center justify-center">
            <CodeBracketIcon className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-white font-medium text-lg tracking-widest">
            Joker
          </h1>
          <h1 className="text-mint-light font-medium text-lg tracking-widest -ml-1">
            Forge
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <nav className="flex-1 px-4">
          <div className="flex justify-between py-3">
            <div className="text-xs text-white-darker tracking-wider uppercase">
              Project
            </div>
            <div className="text-xs text-white-dark tracking-widest">
              {projectName}
            </div>
          </div>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-mint text-black font-medium"
                      : "text-white-light hover:bg-black-light hover:text-white-lighter"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="text-xs text-white-darker mb-3 tracking-wider uppercase ">
              Resources
            </div>
            <div className="space-y-1">
              {resourceItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-mint text-black font-medium"
                        : "text-white-dark hover:text-white-light hover:bg-black-light"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-black-light space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black-darker border-2 border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">
              Import Mod
            </span>
          </button>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black-darker border-2 border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer">
            <BookmarkIcon className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">Save Mod</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exportLoading || jokers.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mint border-2 border-mint-dark rounded-lg text-black font-medium hover:bg-mint-light transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span className="text-sm tracking-wide">
              {exportLoading ? "Exporting..." : "Export Mod"}
            </span>
          </button>

          <div className="text-center mt-4">
            <span className="text-xs text-mint font-medium tracking-widest">
              PRE-ALPHA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
