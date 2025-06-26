import React from "react";
import {
  HomeIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { JokerData } from "../JokerCard";

interface OverviewPageProps {
  jokerCount: number;
  jokers: JokerData[];
  modName: string;
  authorName: string;
  onExport: () => void;
  onNavigate: (section: string) => void;
}

interface ImplementationStats {
  triggers: { implemented: number; total: number; percentage: number };
  conditions: { implemented: number; total: number; percentage: number };
  effects: { implemented: number; total: number; percentage: number };
  ui: { implemented: number; total: number; percentage: number };
}

const parseImplementationStats = async (): Promise<ImplementationStats> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Jayd-H/joker-forge/main/README.md"
    );
    const readmeContent = await response.text();

    console.log("README fetched successfully, length:", readmeContent.length);

    const parseSection = (
      sectionName: string
    ): { implemented: number; total: number } => {
      // Split the content by ### headers to isolate sections
      const sections = readmeContent.split(/^### /m);
      const targetSection = sections.find((section) =>
        section.toLowerCase().startsWith(sectionName.toLowerCase())
      );

      if (!targetSection) {
        console.warn(`Section "${sectionName}" not found in README`);
        console.log(
          "Available sections:",
          sections.map((s) => s.split("\n")[0]).slice(1)
        );
        return { implemented: 0, total: 0 };
      }

      console.log(
        `Found section "${sectionName}", length: ${targetSection.length}`
      );

      // Count checkboxes in this section
      const implementedMatches = targetSection.match(/- \[x\]/gi) || [];
      const notImplementedMatches = targetSection.match(/- \[ \]/g) || [];

      const implementedCount = implementedMatches.length;
      const notImplementedCount = notImplementedMatches.length;
      const totalCount = implementedCount + notImplementedCount;

      console.log(
        `${sectionName}: Found ${implementedCount} [x] and ${notImplementedCount} [ ]`
      );
      console.log(
        `${sectionName}: ${implementedCount}/${totalCount} implemented`
      );

      return { implemented: implementedCount, total: totalCount };
    };

    const triggers = parseSection("Triggers");
    const conditions = parseSection("Conditions");
    const effects = parseSection("Effects");
    const ui = parseSection("UI Features");

    return {
      triggers: {
        ...triggers,
        percentage:
          Math.round((triggers.implemented / triggers.total) * 100) || 0,
      },
      conditions: {
        ...conditions,
        percentage:
          Math.round((conditions.implemented / conditions.total) * 100) || 0,
      },
      effects: {
        ...effects,
        percentage:
          Math.round((effects.implemented / effects.total) * 100) || 0,
      },
      ui: {
        ...ui,
        percentage: Math.round((ui.implemented / ui.total) * 100) || 0,
      },
    };
  } catch (error) {
    console.warn("Could not parse README stats, using fallback:", error);
    return {
      triggers: { implemented: 13, total: 21, percentage: 62 },
      conditions: { implemented: 14, total: 19, percentage: 74 },
      effects: { implemented: 15, total: 19, percentage: 79 },
      ui: { implemented: 8, total: 14, percentage: 57 },
    };
  }
};

const OverviewPage: React.FC<OverviewPageProps> = ({
  jokerCount,
  jokers,
  modName,
  authorName,
  onExport,
  onNavigate,
}) => {
  const [stats, setStats] = React.useState<ImplementationStats>({
    triggers: { implemented: 13, total: 19, percentage: 68 },
    conditions: { implemented: 14, total: 20, percentage: 70 },
    effects: { implemented: 15, total: 22, percentage: 68 },
    ui: { implemented: 8, total: 14, percentage: 57 },
  });

  React.useEffect(() => {
    parseImplementationStats().then(setStats);
  }, []);

  const validateJoker = (joker: JokerData) => {
    const issues = [];
    if (!joker.imagePreview) issues.push("Missing image");
    if (!joker.name || joker.name.trim() === "" || joker.name === "New Joker")
      issues.push("Generic or missing name");
    if (!joker.rules || joker.rules.length === 0)
      issues.push("No rules defined");
    return issues;
  };

  const incompleteJokers = jokers.filter(
    (joker) => validateJoker(joker).length > 0
  );
  const completeJokers = jokers.filter(
    (joker) => validateJoker(joker).length === 0
  );

  const overallProgress = Math.round(
    ((stats.triggers.implemented +
      stats.conditions.implemented +
      stats.effects.implemented +
      stats.ui.implemented) /
      (stats.triggers.total +
        stats.conditions.total +
        stats.effects.total +
        stats.ui.total)) *
      100
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <HomeIcon className="h-8 w-8 text-mint" />
        <h1 className="text-3xl text-white-light font-light tracking-wide">
          Project Overview
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white-light font-light tracking-wide">
                Your Project
              </h2>
              <ChartBarIcon className="h-6 w-6 text-mint" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white-light font-medium text-sm">
                    {modName || "Unnamed Mod"}
                  </span>
                  <span className="text-xs text-white-darker bg-black border border-black-lighter rounded px-2 py-1">
                    v1.0.0
                  </span>
                </div>
                <p className="text-white-darker text-xs">
                  by {authorName || "Anonymous"}
                </p>
              </div>

              <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white-darker text-xs">
                    Total Jokers
                  </span>
                  <span className="text-xl font-bold text-mint">
                    {jokerCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">
                    {completeJokers.length} Complete
                  </span>
                  <span className="text-orange-400">
                    {incompleteJokers.length} Incomplete
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold text-white-light">
                  {jokerCount}
                </div>
                <div className="text-xs text-white-darker">Jokers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white-darker">0</div>
                <div className="text-xs text-white-darker">Consumables</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white-darker">0</div>
                <div className="text-xs text-white-darker">Decks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white-darker">0</div>
                <div className="text-xs text-white-darker">Editions</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-white-light font-medium mb-3 flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-4 w-4 text-mint" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate("jokers")}
                  className="flex items-center gap-2 p-3 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Joker</span>
                </button>
                <button
                  onClick={() => onNavigate("metadata")}
                  className="flex items-center gap-2 p-3 bg-black-darker border border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer text-sm"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Edit Mod Info</span>
                </button>
                <button
                  onClick={onExport}
                  disabled={jokerCount === 0}
                  className="flex items-center gap-2 p-3 bg-black-darker border border-mint-dark rounded-lg text-mint-light hover:bg-mint hover:text-black-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  <span>Export Mod</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-mint" />
              <h3 className="text-lg text-white-light font-medium">
                Recent Activity
              </h3>
            </div>
            {jokerCount === 0 ? (
              <div className="text-center py-4">
                <div className="text-white-darker text-sm">No activity yet</div>
                <div className="text-white-darker text-xs mt-1">
                  Start by creating your first joker
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-mint rounded-full"></div>
                  <span className="text-white-light">
                    Created {jokerCount} joker{jokerCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {incompleteJokers.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-white-darker">
                      {incompleteJokers.length} joker
                      {incompleteJokers.length !== 1 ? "s" : ""} need attention
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-black-dark border-2 border-mint-dark rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CodeBracketIcon className="h-6 w-6 text-mint" />
            <h2 className="text-xl text-white-light font-light tracking-wide">
              About Joker Forge
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-white-light text-sm leading-relaxed mb-4">
                Joker Forge is a visual tool for creating custom Balatro jokers
                using the SMODS framework. Design unique joker behaviors without
                writing Lua code directly. This is just a solo-developer
                project, in its current state expect bad UI, annoyances, and
                bugs. The premise is not to make the most polished generated
                code, but rather to provide a functional and flexible tool for
                modders.
              </p>
              <p className="text-white-light text-sm leading-relaxed mb-4">
                Please note that I am not a wizard with the SMODS API, so if you
                find any bugs with the generated code or with the UI, feel free
                to open an issue on the Github repository.
              </p>
            </div>
            <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
              <h4 className="text-white-light font-medium text-sm mb-3">
                How It Works
              </h4>
              <div className="space-y-2 text-xs text-white-darker">
                <div className="flex items-center gap-2">
                  <span className="bg-trigger text-black px-2 py-1 rounded text-xs font-medium">
                    1
                  </span>
                  <span>Choose triggers (when effects activate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-condition text-black px-2 py-1 rounded text-xs font-medium">
                    2
                  </span>
                  <span>Set conditions (requirements to check)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-effect text-black px-2 py-1 rounded text-xs font-medium">
                    3
                  </span>
                  <span>Define effects (what happens)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-mint text-black px-2 py-1 rounded text-xs font-medium">
                    4
                  </span>
                  <span>Export as working SMODS mod</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white-light font-light tracking-wide flex items-center gap-2">
                <BeakerIcon className="h-6 w-6 text-mint" />
                Implementation Status
              </h2>
              <span className="text-xs text-mint bg-mint/20 px-3 py-1 rounded">
                ACTIVE DEVELOPMENT
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white-light">Triggers</span>
                  <span className="text-xs text-white-darker">
                    {stats.triggers.implemented}/{stats.triggers.total}
                  </span>
                </div>
                <div className="w-full bg-black-lighter rounded-full h-2">
                  <div
                    className="bg-trigger h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.triggers.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white-light">Conditions</span>
                  <span className="text-xs text-white-darker">
                    {stats.conditions.implemented}/{stats.conditions.total}
                  </span>
                </div>
                <div className="w-full bg-black-lighter rounded-full h-2">
                  <div
                    className="bg-condition h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.conditions.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white-light">Effects</span>
                  <span className="text-xs text-white-darker">
                    {stats.effects.implemented}/{stats.effects.total}
                  </span>
                </div>
                <div className="w-full bg-black-lighter rounded-full h-2">
                  <div
                    className="bg-effect h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.effects.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white-light">UI Features</span>
                  <span className="text-xs text-white-darker">
                    {stats.ui.implemented}/{stats.ui.total}
                  </span>
                </div>
                <div className="w-full bg-black-lighter rounded-full h-2">
                  <div
                    className="bg-mint h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.ui.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6 flex-1">
            <h3 className="text-lg text-white-light font-medium mb-4">
              Recently Added
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-4 w-4 text-mint" />
                <span className="text-sm text-white-light">
                  Passive trigger support
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-4 w-4 text-mint" />
                <span className="text-sm text-white-light">
                  Card destruction effects
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-4 w-4 text-mint" />
                <span className="text-sm text-white-light">
                  Random chance effects
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6 flex-1">
            <h3 className="text-lg text-white-light font-medium mb-4">
              Coming Soon
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white-darker">
                  Consumable card editor
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white-darker">
                  Custom deck support
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white-darker">
                  Blueprint compatibility
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black-darker border border-black-lighter rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <EyeIcon className="h-5 w-5 text-mint" />
          <h3 className="text-lg text-white-light font-medium">
            Current Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-mint mb-1">PRE-ALPHA</div>
            <div className="text-sm text-white-darker">Development Stage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white-light mb-1">
              {overallProgress}%
            </div>
            <div className="text-sm text-white-darker">Feature Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white-light mb-1">
              {jokerCount > 0 ? "READY" : "PENDING"}
            </div>
            <div className="text-sm text-white-darker">Export Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
