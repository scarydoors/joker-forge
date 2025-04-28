import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { JokerData } from "./JokerCard";

interface JokerFormProps {
  joker: JokerData | null;
  onSaveJoker: (joker: JokerData) => void;
  onDeleteJoker: (jokerId: string) => void;
  modName: string;
}

const formatButtons = [
  { tag: "{}", label: "Close Tag", color: "text-white" },
  { tag: "{C:blue}", label: "Blue", color: "bg-balatro-blue" },
  { tag: "{C:red}", label: "Red", color: "bg-balatro-red" },
  { tag: "{C:orange}", label: "Orange", color: "bg-balatro-orange" },
  { tag: "{C:green}", label: "Green", color: "bg-balatro-green" },
  { tag: "{C:purple}", label: "Purple", color: "bg-balatro-purple" },
  { tag: "{C:attention}", label: "Attention", color: "bg-balatro-planet" },
  { tag: "{C:chips}", label: "Chips", color: "bg-balatro-chips" },
  { tag: "{C:mult}", label: "Mult", color: "bg-balatro-mult" },
  { tag: "{C:money}", label: "Money", color: "bg-balatro-money" },
  { tag: "{X:mult,C:white}", label: "XMult", color: "text-white" },
  { tag: "[s]", label: "New Line", color: "bg-balatro-grey" },
];

const rarityOptions = [
  { value: 1, label: "Common", color: "bg-balatro-blue" },
  { value: 2, label: "Uncommon", color: "bg-balatro-green" },
  { value: 3, label: "Rare", color: "bg-balatro-red" },
  { value: 4, label: "Legendary", color: "bg-balatro-purple" },
];

const JokerForm: React.FC<JokerFormProps> = ({
  joker,
  onSaveJoker,
  onDeleteJoker,
}) => {
  const [formData, setFormData] = useState<JokerData>(
    joker || {
      id: crypto.randomUUID(),
      name: "New Joker",
      description: "A {C:blue}custom{} joker with {C:red}unique{} effects.",
      chipAddition: 0,
      multAddition: 0,
      xMult: 1,
      imagePreview: "",
      rarity: 1,
    }
  );
  const [changesExist, setChangesExist] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (joker) {
      setFormData(joker);
      setChangesExist(false);
    }
  }, [joker]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setChangesExist(true);
  };

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = parseFloat(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
    setChangesExist(true);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Create an image element to check dimensions
        const img = new Image();
        img.onload = () => {
          // Check if dimensions match the required 142x190
          if (img.width === 142 && img.height === 190) {
            setFormData((prev) => ({
              ...prev,
              imagePreview: reader.result as string,
            }));
            setChangesExist(true);
          } else {
            // Show error for incorrect dimensions
            alert(
              `Image dimensions must be 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRarityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      rarity: value,
    }));
    setChangesExist(true);
  };

  const insertFormatTag = (tag: string) => {
    if (!descriptionRef.current) return;
    const startPos = descriptionRef.current.selectionStart;
    const endPos = descriptionRef.current.selectionEnd;
    const currentValue = descriptionRef.current.value;
    const newValue =
      currentValue.substring(0, startPos) +
      tag +
      currentValue.substring(endPos);

    // Update formData
    setFormData((prev) => ({
      ...prev,
      description: newValue,
    }));
    setChangesExist(true);

    // Set cursor position after the inserted tag
    setTimeout(() => {
      if (descriptionRef.current) {
        descriptionRef.current.focus();
        descriptionRef.current.setSelectionRange(
          startPos + tag.length,
          startPos + tag.length
        );
      }
    }, 0);
  };

  const handleSave = () => {
    onSaveJoker({ ...formData });
    setChangesExist(false);
  };

  const handleDelete = () => {
    if (
      joker &&
      window.confirm("Are you sure you want to delete this joker?")
    ) {
      onDeleteJoker(joker.id);
    }
  };

  if (!joker && !formData) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p className="text-center text-lg">
          Select a joker to edit or create a new one
        </p>
      </div>
    );
  }

  const createAutoDescription = () => {
    if (
      formData.description ===
      "A {C:blue}custom{} joker with {C:red}unique{} effects."
    ) {
      const effects: string[] = [];

      if (formData.chipAddition > 0) {
        effects.push(`{C:chips}+${formData.chipAddition} Chips{}`);
      }

      if (formData.multAddition > 0) {
        effects.push(`{C:mult}+${formData.multAddition} Mult{}`);
      }

      if (formData.xMult > 1) {
        effects.push(`{X:mult,C:white}X${formData.xMult}{}`);
      }

      if (effects.length > 0) {
        setFormData((prev) => ({
          ...prev,
          description: `${effects.join(", ")}`,
        }));
        setChangesExist(true);
      }
    }
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-balatro-transparentblack pixel-corners-medium p-6">
      <h2 className="text-2xl text-white text-shadow-pixel text-center mb-4">
        {joker ? "Edit Joker" : "New Joker"}
      </h2>

      <div className="space-y-4">
        {/* Image and name section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Image upload */}
          <div>
            <label className="block text-white mb-2 text-shadow-pixel">
              Image
            </label>
            <div className="aspect-[2/3] w-28 mx-auto pixel-corners-medium overflow-hidden mb-2">
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="Joker Preview"
                  className="w-full h-full object-contain pixelated"
                  draggable="false"
                />
              ) : (
                <img
                  src="/images/placeholder-joker.png"
                  alt="Default Joker"
                  className="w-full h-full object-contain pixelated"
                  draggable="false"
                />
              )}
            </div>

            <div className="flex space-x-2 mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-balatro-grey hover:bg-balatro-light-black text-white py-1 pixel-corners-small transition-colors relative"
                style={{ transition: "background-color 0.2s ease" }}
              >
                <span className="relative z-10 text-shadow-pixel">
                  Browse...
                </span>
              </button>

              {formData.imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, imagePreview: "" }));
                    setChangesExist(true);
                  }}
                  className="flex-1 bg-balatro-red hover:bg-balatro-redshadow text-white py-1 pixel-corners-small transition-colors relative"
                  style={{ transition: "background-color 0.2s ease" }}
                >
                  <span className="relative z-10 text-shadow-pixel">Clear</span>
                </button>
              )}

              <div className="text-xs text-balatro-lightgrey mt-1">
                Note: Image must be exactly 142×190 pixels
              </div>
            </div>
          </div>

          {/* Name and rarity */}
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 text-shadow-pixel">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small focus:outline-none focus:ring-1 focus:ring-balatro-attention"
                maxLength={25}
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-shadow-pixel">
                Rarity
              </label>
              <div className="relative">
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleRarityChange}
                  className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small focus:outline-none focus:ring-1 focus:ring-balatro-attention appearance-none"
                >
                  {rarityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div
                    className={`w-4 h-4 ${
                      rarityOptions[formData.rarity].color
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white mb-2 text-shadow-pixel">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            ref={descriptionRef}
            className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small focus:outline-none focus:ring-1 focus:ring-balatro-attention h-20"
            maxLength={120}
          />

          {/* Text format buttons */}
          <div className="mt-2">
            <div className="text-white text-sm mb-2">Format Tags:</div>
            <div className="grid grid-cols-4 gap-2">
              {formatButtons.map((btn) => (
                <button
                  key={btn.tag}
                  type="button"
                  className={`${btn.color} text-xs text-white px-1 py-1 pixel-corners-small`}
                  onClick={() => insertFormatTag(btn.tag)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="text-xs mt-2 text-balatro-lightgrey">
              Tip: Remember to close color tags with {"{}"} after the colored
              text
            </div>
            <div className="mt-2">
              <button
                className="bg-balatro-grey hover:bg-balatro-light-black text-xs text-white px-3 py-1 pixel-corners-small"
                onClick={createAutoDescription}
              >
                Auto Generate Description From Effects
              </button>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div>
          <label className="block text-white mb-2 text-shadow-pixel">
            Effects
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* Chips */}
            <div>
              <div className="flex items-center bg-balatro-grey pixel-corners-small">
                <div className="w-8 h-8 bg-balatro-chips flex-shrink-0 flex items-center justify-center pixel-corners-small">
                  <span className="text-white text-shadow-pixel font-bold">
                    +
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.chipAddition}
                  onChange={(e) => handleNumberChange(e, "chipAddition")}
                  className="w-full bg-transparent text-white px-2 py-1 focus:outline-none"
                  min="0"
                  step="1"
                />
              </div>
              <div className="text-xs text-balatro-chips mt-1 text-center">
                Chips
              </div>
            </div>

            {/* Mult */}
            <div>
              <div className="flex items-center bg-balatro-grey pixel-corners-small">
                <div className="w-8 h-8 bg-balatro-mult flex-shrink-0 flex items-center justify-center pixel-corners-small">
                  <span className="text-white text-shadow-pixel font-bold">
                    +
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.multAddition}
                  onChange={(e) => handleNumberChange(e, "multAddition")}
                  className="w-full bg-transparent text-white px-2 py-1 focus:outline-none"
                  min="0"
                  step="1"
                />
              </div>
              <div className="text-xs text-balatro-mult mt-1 text-center">
                Mult
              </div>
            </div>

            {/* xMult */}
            <div>
              <div className="flex items-center bg-balatro-grey pixel-corners-small">
                <div className="w-8 h-8 bg-balatro-money flex-shrink-0 flex items-center justify-center pixel-corners-small">
                  <span className="text-white text-shadow-pixel font-bold">
                    ×
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.xMult}
                  onChange={(e) => handleNumberChange(e, "xMult")}
                  className="w-full bg-transparent text-white px-2 py-1 focus:outline-none"
                  min="1"
                  step="0.1"
                />
              </div>
              <div className="text-xs text-balatro-money mt-1 text-center">
                xMult
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!changesExist}
            className={`flex-1 ${
              changesExist
                ? "bg-balatro-green hover:bg-balatro-greenshadow"
                : "bg-balatro-grey cursor-not-allowed"
            } text-white py-2 pixel-corners-small transition-colors`}
            style={{ transition: "background-color 0.2s ease" }}
          >
            <span className="text-shadow-pixel">Save Changes</span>
          </button>

          {joker && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-balatro-red hover:bg-balatro-redshadow text-white py-2 pixel-corners-small transition-colors"
              style={{ transition: "background-color 0.2s ease" }}
            >
              <span className="text-shadow-pixel">Delete Joker</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JokerForm;
