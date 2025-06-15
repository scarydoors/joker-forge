import { useState } from "react";
import {
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  CodeBracketIcon,
  HashtagIcon,
  ClockIcon,
  ShieldCheckIcon,
  CubeIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import InputField from "../generic/InputField";

interface ModMetadataPageProps {
  modName: string;
  setModName: (name: string) => void;
  authorName: string;
  setAuthorName: (name: string) => void;
}

const ModMetadataPage: React.FC<ModMetadataPageProps> = ({
  modName,
  setModName,
  authorName,
  setAuthorName,
}) => {
  // Required SMODS fields
  const [modId, setModId] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [modPrefix, setModPrefix] = useState("");
  const [mainFile, setMainFile] = useState("main.lua");

  // Optional SMODS fields
  const [modVersion, setModVersion] = useState("1.0.0");
  const [priority, setPriority] = useState("0");
  const [badgeColour, setBadgeColour] = useState("666665");
  const [badgeTextColour, setBadgeTextColour] = useState("FFFFFF");
  const [displayName, setDisplayName] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [conflicts, setConflicts] = useState("");
  const [provides, setProvides] = useState("");

  // Validation helpers
  const isValidHexColor = (color: string) =>
    /^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);

  const requiredFieldsComplete =
    modName && authorName && modId && modDescription && modPrefix;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <DocumentTextIcon className="h-8 w-8 text-mint" />
        <h1 className="text-2xl text-white-light font-light tracking-wide">
          Mod Metadata
        </h1>
        <p className="text-white-darker text-sm opacity-50">
          Please note, only mod name and author are editable for now, I need to
          update the code generation. bare with me haha
        </p>
      </div>

      <div className="space-y-6">
        {/* Required Fields */}
        <div className="bg-black-dark border-2 border-mint-dark rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            Required Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              value={modName}
              onChange={(e) => setModName(e.target.value)}
              placeholder="My Custom Mod"
              separator={true}
              icon={<DocumentTextIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Mod Name"
            />
            <InputField
              value={modId}
              onChange={(e) => setModId(e.target.value)}
              placeholder="mycustommod"
              separator={true}
              icon={<HashtagIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Mod ID"
              disabled
            />
            <InputField
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              separator={true}
              icon={<UserIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Author"
            />
            <InputField
              value={modPrefix}
              onChange={(e) => setModPrefix(e.target.value)}
              placeholder="mycustommod"
              separator={true}
              icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Prefix"
              disabled
            />
            <div className="md:col-span-2">
              <label className="block text-white-light text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={modDescription}
                onChange={(e) => setModDescription(e.target.value)}
                placeholder="Custom jokers created with Joker Forge"
                className="w-full h-24 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none opacity-50"
                disabled
              />
            </div>
            <InputField
              value={mainFile}
              onChange={(e) => setMainFile(e.target.value)}
              placeholder="main.lua"
              separator={true}
              icon={<CodeBracketIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Main File"
              disabled
            />
          </div>
          <p className="text-red-400 text-xs mt-3">
            * All fields in this section are required by SMODS
          </p>
          <p className="text-white-darker text-xs mt-1 opacity-50">
            ID, prefix, description, and main file coming soon
          </p>
        </div>

        {/* Appearance & Display */}
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-4 flex items-center gap-2">
            <PaintBrushIcon className="h-5 w-5 text-mint" />
            Appearance & Display
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Short name for badge"
              separator={true}
              icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Display Name"
              disabled
            />
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Badge Color
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    value={badgeColour}
                    onChange={(e) => setBadgeColour(e.target.value)}
                    placeholder="666665"
                    separator={true}
                    icon={<span className="text-mint">#</span>}
                    disabled
                  />
                </div>
                <div
                  className="w-10 h-10 rounded border-2 border-black-light"
                  style={{
                    backgroundColor: isValidHexColor(badgeColour)
                      ? `#${badgeColour}`
                      : "#666665",
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Badge Text Color
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    value={badgeTextColour}
                    onChange={(e) => setBadgeTextColour(e.target.value)}
                    placeholder="FFFFFF"
                    separator={true}
                    icon={<span className="text-mint">#</span>}
                    disabled
                  />
                </div>
                <div
                  className="w-10 h-10 rounded border-2 border-black-light flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: isValidHexColor(badgeColour)
                      ? `#${badgeColour}`
                      : "#666665",
                    color: isValidHexColor(badgeTextColour)
                      ? `#${badgeTextColour}`
                      : "#FFFFFF",
                  }}
                >
                  {displayName || modName?.substring(0, 2) || "AB"}
                </div>
              </div>
            </div>
          </div>
          <p className="text-white-darker text-xs mt-2 opacity-50">
            Badge customization coming soon
          </p>
        </div>

        {/* Version & Loading */}
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-mint" />
            Version & Loading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              value={modVersion}
              onChange={(e) => setModVersion(e.target.value)}
              placeholder="1.0.0"
              separator={true}
              icon={<HashtagIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Version"
              disabled
            />
            <InputField
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="1"
              separator={true}
              icon={<CubeIcon className="h-5 w-5 text-mint stroke-2" />}
              label="Priority"
              disabled
            />
          </div>
          <div className="mt-3 p-3 bg-black-darker border border-black-light rounded-lg">
            <p className="text-white-darker text-sm">
              <strong className="text-white-light">Version:</strong> Must follow
              format (major).(minor).(patch). Use ~ for beta versions.
            </p>
            <p className="text-white-darker text-sm mt-1">
              <strong className="text-white-light">Priority:</strong> Negative
              values load first, positive values load last. Default: 0
            </p>
          </div>
          <p className="text-white-darker text-xs mt-2 opacity-50">
            Version and priority management coming soon
          </p>
        </div>

        {/* Dependencies & Conflicts */}
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-mint" />
            Dependencies & Conflicts
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Dependencies
              </label>
              <textarea
                value={dependencies}
                onChange={(e) => setDependencies(e.target.value)}
                placeholder={`Steamodded (>=1.0.0~BETA-0404a)\nLovely (>=0.6)\nSomeMod (==1.0.*)`}
                className="w-full h-20 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none opacity-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Conflicts
              </label>
              <textarea
                value={conflicts}
                onChange={(e) => setConflicts(e.target.value)}
                placeholder={`SomeMod (>=1.1) (<<2~)`}
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none opacity-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Provides
              </label>
              <textarea
                value={provides}
                onChange={(e) => setProvides(e.target.value)}
                placeholder={`SomeAPIMod (1.0)`}
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none opacity-50"
                disabled
              />
            </div>
          </div>
          <div className="mt-3 p-3 bg-black-darker border border-black-light rounded-lg">
            <p className="text-white-darker text-sm">
              <strong className="text-white-light">Dependencies:</strong>{" "}
              Required mods with version constraints (&gt;=, ==, &lt;&lt;,
              &gt;&gt;, etc.)
            </p>
            <p className="text-white-darker text-sm mt-1">
              <strong className="text-white-light">Conflicts:</strong> Mods that
              cannot be installed alongside this mod
            </p>
            <p className="text-white-darker text-sm mt-1">
              <strong className="text-white-light">Provides:</strong>{" "}
              Alternative mod IDs this mod can fulfill dependencies for
            </p>
          </div>
          <p className="text-white-darker text-xs mt-2 opacity-50">
            Dependency management coming soon
          </p>
        </div>

        {/* Status Indicator */}
        <div
          className={`bg-black-dark border-2 rounded-lg p-4 ${
            requiredFieldsComplete ? "border-mint/30" : "border-red-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  requiredFieldsComplete
                    ? "bg-mint animate-pulse"
                    : "bg-red-400"
                }`}
              ></div>
              <span className="text-white-light font-medium">
                SMODS Metadata Status (THIS IS BROKEN FOR NOW IGNORE)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {requiredFieldsComplete ? (
                <CheckCircleIcon className="h-5 w-5 text-mint" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
              <span
                className={`text-sm ${
                  requiredFieldsComplete ? "text-mint" : "text-red-400"
                }`}
              >
                {requiredFieldsComplete
                  ? "Export Ready"
                  : "Missing Required Fields"}
              </span>
            </div>
          </div>
          {!requiredFieldsComplete && (
            <p className="text-white-darker text-sm mt-2">
              Complete mod name and author to prepare for export. Other required
              fields coming soon.
            </p>
          )}
        </div>

        {/* JSON Preview */}
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg p-6">
          <h2 className="text-lg text-white-light font-medium mb-4 flex items-center gap-2">
            <CodeBracketIcon className="h-5 w-5 text-mint" />
            Generated Metadata Preview
          </h2>
          <div className="bg-black-darker border border-black-light rounded-lg p-4">
            <pre className="text-white-darker text-sm font-mono overflow-x-auto">
              {`{
  "id": "${modId || "your_mod_id"}",
  "name": "${modName || "Your Mod Name"}",
  "author": ["${authorName || "Your Name"}"],
  "description": "${modDescription || "A description of your mod."}",
  "prefix": "${modPrefix || "prefix"}",
  "main_file": "${mainFile}",
  "version": "${modVersion}",
  "priority": ${priority},
  "badge_colour": "${badgeColour}",
  "badge_text_colour": "${badgeTextColour}",
  "display_name": "${displayName || modName || "Your Mod Name"}",
  "dependencies": [],
  "conflicts": [],
  "provides": []
}`}
            </pre>
          </div>
          <p className="text-white-darker text-xs mt-2 opacity-50">
            This preview shows the SMODS metadata JSON that will be generated
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModMetadataPage;
