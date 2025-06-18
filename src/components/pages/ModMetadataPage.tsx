import { useEffect, useState } from "react";
import {
  DocumentTextIcon,
  TagIcon,
  CodeBracketIcon,
  HashtagIcon,
  ClockIcon,
  ShieldCheckIcon,
  CubeIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import InputField from "../generic/InputField";

export interface ModMetadata {
  id: string;
  name: string;
  author: string[];
  description: string;
  prefix: string;
  main_file: string;
  version: string;
  priority: number;
  badge_colour: string;
  badge_text_colour: string;
  display_name: string;
  dependencies: string[];
  conflicts: string[];
  provides: string[];
  dump_loc?: boolean;
}

interface ModMetadataValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export const DEFAULT_MOD_METADATA: ModMetadata = {
  id: "",
  name: "",
  author: [],
  description: "",
  prefix: "",
  main_file: "main.lua",
  version: "1.0.0",
  priority: 0,
  badge_colour: "666665",
  badge_text_colour: "FFFFFF",
  display_name: "",
  dependencies: ["Steamodded (>=1.0.0~BETA-0404a)"],
  conflicts: [],
  provides: [],
};

const validateModMetadata = (metadata: ModMetadata): ModMetadataValidation => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!metadata.id) {
    errors.id = "Mod ID is required";
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(metadata.id)) {
    errors.id =
      "Mod ID must start with a letter and contain only letters, numbers, and underscores";
  } else if (["Steamodded", "Lovely", "Balatro"].includes(metadata.id)) {
    errors.id = "Mod ID cannot be 'Steamodded', 'Lovely', or 'Balatro'";
  }

  if (!metadata.name.trim()) {
    errors.name = "Mod name is required";
  }

  if (
    !metadata.author ||
    metadata.author.length === 0 ||
    !metadata.author[0].trim()
  ) {
    errors.author = "At least one author is required";
  }

  if (!metadata.description.trim()) {
    errors.description = "Description is required";
  }

  if (!metadata.prefix) {
    errors.prefix = "Prefix is required";
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(metadata.prefix)) {
    errors.prefix =
      "Prefix must start with a letter and contain only letters, numbers, and underscores";
  }

  if (!metadata.main_file) {
    errors.main_file = "Main file is required";
  } else if (!metadata.main_file.endsWith(".lua")) {
    errors.main_file = "Main file must end with .lua extension";
  }

  if (metadata.version && !/^\d+\.\d+\.\d+.*$/.test(metadata.version)) {
    warnings.version = "Version should follow format (major).(minor).(patch)";
  }

  if (
    metadata.badge_colour &&
    !/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(metadata.badge_colour)
  ) {
    warnings.badge_colour =
      "Badge colour should be a valid hex color (6 or 8 digits)";
  }

  if (
    metadata.badge_text_colour &&
    !/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(metadata.badge_text_colour)
  ) {
    warnings.badge_text_colour =
      "Badge text colour should be a valid hex color (6 or 8 digits)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

const generateModIdFromName = (name: string): string => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/^[0-9]+/, "") || "custommod"
  );
};

const generatePrefixFromId = (id: string): string => {
  return id.toLowerCase().substring(0, 8);
};

const parseAuthorsString = (authorsString: string): string[] => {
  return authorsString
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
};

const formatAuthorsString = (authors: string[]): string => {
  return authors.join(", ");
};

const parseDependenciesString = (dependenciesString: string): string[] => {
  return dependenciesString
    .split("\n")
    .map((dep) => dep.trim())
    .filter((dep) => dep.length > 0);
};

const formatDependenciesString = (dependencies: string[]): string => {
  return dependencies.join("\n");
};

interface ModMetadataPageProps {
  metadata: ModMetadata;
  setMetadata: (metadata: ModMetadata) => void;
}

const ModMetadataPage: React.FC<ModMetadataPageProps> = ({
  metadata,
  setMetadata,
}) => {
  const [authorsString, setAuthorsString] = useState(
    formatAuthorsString(metadata.author)
  );
  const [dependenciesString, setDependenciesString] = useState(
    formatDependenciesString(metadata.dependencies)
  );
  const [conflictsString, setConflictsString] = useState(
    formatDependenciesString(metadata.conflicts)
  );
  const [providesString, setProvidesString] = useState(
    formatDependenciesString(metadata.provides)
  );

  useEffect(() => {
    if (metadata.name) {
      const generatedId = generateModIdFromName(metadata.name);
      const generatedPrefix = generatePrefixFromId(generatedId);

      setMetadata({
        ...metadata,
        id: generatedId,
        prefix: generatedPrefix,
        display_name: metadata.name,
      });
    }
    //! needs work
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.name]);

  const validation = validateModMetadata(metadata);

  const updateMetadata = (updates: Partial<ModMetadata>) => {
    setMetadata({ ...metadata, ...updates });
  };

  const handleAuthorsChange = (value: string) => {
    setAuthorsString(value);
    updateMetadata({ author: parseAuthorsString(value) });
  };

  const handleDependenciesChange = (value: string) => {
    setDependenciesString(value);
    updateMetadata({ dependencies: parseDependenciesString(value) });
  };

  const handleConflictsChange = (value: string) => {
    setConflictsString(value);
    updateMetadata({ conflicts: parseDependenciesString(value) });
  };

  const handleProvidesChange = (value: string) => {
    setProvidesString(value);
    updateMetadata({ provides: parseDependenciesString(value) });
  };

  const isValidHexColor = (color: string) =>
    /^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);

  const hasErrors = Object.keys(validation.errors).length > 0;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <DocumentTextIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Mod Metadata
        </h1>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div
          className={`bg-black-darker border-2 rounded-lg p-6 ${
            validation.isValid
              ? "border-mint/30"
              : hasErrors
              ? "border-red-900/50"
              : "border-yellow-600/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-3 h-3 rounded-full ${
                validation.isValid
                  ? "bg-mint animate-pulse"
                  : hasErrors
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            ></div>
            <span className="text-white-light font-medium text-sm">
              SMODS Status
            </span>
          </div>

          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircleIcon className="h-4 w-4 text-mint" />
            ) : hasErrors ? (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
            ) : (
              <InformationCircleIcon className="h-4 w-4 text-yellow-400" />
            )}
            <span
              className={`text-xs ${
                validation.isValid
                  ? "text-mint"
                  : hasErrors
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {validation.isValid
                ? "Export Ready"
                : hasErrors
                ? "Has Errors"
                : "Has Warnings"}
            </span>
          </div>

          {hasErrors && (
            <div className="mt-3 space-y-1">
              {Object.entries(validation.errors)
                .slice(0, 3)
                .map(([field, error]) => (
                  <p key={field} className="text-red-400 text-xs">
                    <strong>{field}:</strong> {error}
                  </p>
                ))}
              {Object.keys(validation.errors).length > 3 && (
                <p className="text-red-400 text-xs">
                  +{Object.keys(validation.errors).length - 3} more errors
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-black-dark border-2 border-mint-dark rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            Required Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                value={metadata.name}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                placeholder="My Custom Mod"
                separator={true}
                icon={
                  <DocumentTextIcon className="h-5 w-5 text-mint stroke-2" />
                }
                label="Mod Name"
              />
              {validation.errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.name}
                </p>
              )}
            </div>

            <div>
              <InputField
                value={metadata.id}
                onChange={(e) => updateMetadata({ id: e.target.value })}
                placeholder="mycustommod"
                separator={true}
                icon={<HashtagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Mod ID"
              />
              {validation.errors.id && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.id}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Must be unique, start with letter, alphanumeric + underscore
                only
              </p>
            </div>

            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Authors *
              </label>
              <input
                type="text"
                value={authorsString}
                onChange={(e) => handleAuthorsChange(e.target.value)}
                placeholder="Author One, Author Two"
                className="w-full px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none"
              />
              {validation.errors.author && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.author}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Separate multiple authors with commas
              </p>
            </div>

            <div>
              <InputField
                value={metadata.prefix}
                onChange={(e) => updateMetadata({ prefix: e.target.value })}
                placeholder="mycustommod"
                separator={true}
                icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Prefix"
              />
              {validation.errors.prefix && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.prefix}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Added to all object keys, must be unique
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white-light text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) =>
                  updateMetadata({ description: e.target.value })
                }
                placeholder="Custom jokers created with Joker Forge"
                className="w-full h-24 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              {validation.errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.description}
                </p>
              )}
            </div>

            <div>
              <InputField
                value={metadata.main_file}
                onChange={(e) => updateMetadata({ main_file: e.target.value })}
                placeholder="main.lua"
                separator={true}
                icon={
                  <CodeBracketIcon className="h-5 w-5 text-mint stroke-2" />
                }
                label="Main File"
              />
              {validation.errors.main_file && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.main_file}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <PaintBrushIcon className="h-5 w-5 text-mint" />
            Appearance & Display
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <InputField
                value={metadata.display_name}
                onChange={(e) =>
                  updateMetadata({ display_name: e.target.value })
                }
                placeholder={metadata.name || "Short name for badge"}
                separator={true}
                icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Display Name"
              />
              <p className="text-white-darker text-xs mt-1">
                Shown on mod badge, defaults to mod name
              </p>
            </div>

            <div>
              <InputField
                value={metadata.badge_colour}
                onChange={(e) =>
                  updateMetadata({ badge_colour: e.target.value })
                }
                placeholder="666665"
                separator={true}
                icon={<span className="text-mint">#</span>}
                label="Badge Color"
              />
              {validation.warnings.badge_colour && (
                <p className="text-yellow-400 text-xs mt-1">
                  {validation.warnings.badge_colour}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Hex color without #
              </p>
            </div>

            <div>
              <InputField
                value={metadata.badge_text_colour}
                onChange={(e) =>
                  updateMetadata({ badge_text_colour: e.target.value })
                }
                placeholder="FFFFFF"
                separator={true}
                icon={<span className="text-mint">#</span>}
                label="Badge Text Color"
              />
              {validation.warnings.badge_text_colour && (
                <p className="text-yellow-400 text-xs mt-1">
                  {validation.warnings.badge_text_colour}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Hex color without #
              </p>
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
            <h4 className="text-white-light font-medium text-sm mb-3 tracking-wider">
              BADGE PREVIEW
            </h4>
            <div className="flex justify-center">
              <div
                className="px-3 py-1 rounded text-xs font-bold border"
                style={{
                  backgroundColor: isValidHexColor(metadata.badge_colour)
                    ? `#${metadata.badge_colour}`
                    : "#666665",
                  color: isValidHexColor(metadata.badge_text_colour)
                    ? `#${metadata.badge_text_colour}`
                    : "#FFFFFF",
                  borderColor: isValidHexColor(metadata.badge_colour)
                    ? `#${metadata.badge_colour}`
                    : "#666665",
                }}
              >
                {metadata.display_name ||
                  metadata.name?.substring(0, 8) ||
                  "MOD"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
            <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-mint" />
              Version & Loading
            </h2>
            <div className="space-y-6">
              <div>
                <InputField
                  value={metadata.version}
                  onChange={(e) => updateMetadata({ version: e.target.value })}
                  placeholder="1.0.0"
                  separator={true}
                  icon={<HashtagIcon className="h-5 w-5 text-mint stroke-2" />}
                  label="Version"
                />
                {validation.warnings.version && (
                  <p className="text-yellow-400 text-xs mt-1">
                    {validation.warnings.version}
                  </p>
                )}
                <p className="text-white-darker text-xs mt-1">
                  Format: (major).(minor).(patch), use ~ for beta
                </p>
              </div>

              <div>
                <InputField
                  value={metadata.priority.toString()}
                  onChange={(e) =>
                    updateMetadata({
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  separator={true}
                  icon={<CubeIcon className="h-5 w-5 text-mint stroke-2" />}
                  label="Priority"
                />
                <p className="text-white-darker text-xs mt-1">
                  Negative values load first, positive load last
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
            <h4 className="text-white-light font-medium text-sm mb-3 tracking-wider">
              MOD SUMMARY
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white-darker">Name:</span>
                <span className="text-white-light">
                  {metadata.name || "Unnamed"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-darker">ID:</span>
                <span className="text-white-light">
                  {metadata.id || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-darker">Version:</span>
                <span className="text-white-light">{metadata.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-darker">Author:</span>
                <span className="text-white-light">
                  {metadata.author.join(", ") || "Anonymous"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-mint" />
            Dependencies & Conflicts
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Dependencies
              </label>
              <textarea
                value={dependenciesString}
                onChange={(e) => handleDependenciesChange(e.target.value)}
                placeholder="Steamodded (>=1.0.0~BETA-0404a)&#10;Lovely (>=0.6)&#10;SomeMod (==1.0.*)"
                className="w-full h-20 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                One dependency per line, with version constraints (&gt;=, ==,
                &lt;&lt;, etc.)
              </p>
            </div>

            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Conflicts
              </label>
              <textarea
                value={conflictsString}
                onChange={(e) => handleConflictsChange(e.target.value)}
                placeholder="SomeMod (>=1.1) (&lt;&lt;2~)"
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                Mods that cannot be installed alongside this mod
              </p>
            </div>

            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Provides
              </label>
              <textarea
                value={providesString}
                onChange={(e) => handleProvidesChange(e.target.value)}
                placeholder="SomeAPIMod (1.0)"
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                Alternative mod IDs this mod can fulfill dependencies for
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
          <h4 className="text-white-light font-medium text-sm mb-3 tracking-wider">
            JSON PREVIEW
          </h4>
          <div className="bg-black border border-black-light rounded p-3 max-h-60 overflow-y-auto custom-scrollbar">
            <pre className="text-white-darker text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModMetadataPage;
