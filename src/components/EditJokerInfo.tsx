import React, { useState, useRef, useEffect } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  PuzzlePieceIcon,
  LockOpenIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  SparklesIcon,
  BoltIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import InputField from "./generic/InputField";
import InputDropdown from "./generic/InputDropdown";
import Checkbox from "./generic/Checkbox";
import Button from "./generic/Button";
import { BalatroText } from "./generic/balatroTextFormatter";
import { JokerData } from "./JokerCard";

interface EditJokerInfoProps {
  isOpen: boolean;
  joker: JokerData;
  onClose: () => void;
  onSave: (joker: JokerData) => void;
  onDelete: (jokerId: string) => void;
}

const EditJokerInfo: React.FC<EditJokerInfoProps> = ({
  isOpen,
  joker,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<JokerData>(joker);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...joker,
        blueprint_compat: joker.blueprint_compat !== false,
        eternal_compat: joker.eternal_compat !== false,
        unlocked: joker.unlocked !== false,
        discovered: joker.discovered !== false,
      });
    }
  }, [isOpen, joker]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNumberChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      [field]: isNaN(value) ? 0 : value,
    });
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    });
  };

  const handleRarityChange = (value: string) => {
    const rarity = parseInt(value, 10);
    setFormData({
      ...formData,
      rarity,
      cost:
        formData.cost === getCostFromRarity(formData.rarity)
          ? getCostFromRarity(rarity)
          : formData.cost,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 142 && img.height === 190) {
            setFormData({
              ...formData,
              imagePreview: reader.result as string,
            });
          } else {
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

  const getCostFromRarity = (rarity: number): number => {
    switch (rarity) {
      case 1:
        return 4;
      case 2:
        return 5;
      case 3:
        return 6;
      case 4:
        return 8;
      default:
        return 5;
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this joker?")) {
      onDelete(joker.id);
      onClose();
    }
  };

  const insertTag = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "joker-description-edit"
    ) as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const currentValue = textArea.value;
    const selectedText = currentValue.substring(startPos, endPos);

    let newText: string;
    let newCursorPos: number;

    if (autoClose && selectedText) {
      newText =
        currentValue.substring(0, startPos) +
        tag +
        selectedText +
        "{}" +
        currentValue.substring(endPos);
      newCursorPos = startPos + tag.length + selectedText.length + 2;
    } else if (autoClose) {
      newText =
        currentValue.substring(0, startPos) +
        tag +
        "{}" +
        currentValue.substring(endPos);
      newCursorPos = startPos + tag.length;
    } else {
      newText =
        currentValue.substring(0, startPos) +
        tag +
        currentValue.substring(endPos);
      newCursorPos = startPos + tag.length;
    }

    handleInputChange("description", newText);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const colorButtons = [
    { tag: "{C:red}", color: "bg-balatro-red", name: "Red" },
    { tag: "{C:blue}", color: "bg-balatro-blue", name: "Blue" },
    { tag: "{C:green}", color: "bg-balatro-green", name: "Green" },
    { tag: "{C:purple}", color: "bg-balatro-purple", name: "Purple" },
    { tag: "{C:orange}", color: "bg-balatro-orange", name: "Orange" },
    { tag: "{C:money}", color: "bg-balatro-money", name: "Money" },
    { tag: "{C:attention}", color: "bg-balatro-planet", name: "Attention" },
    { tag: "{C:chips}", color: "bg-balatro-chips", name: "Chips" },
    { tag: "{C:mult}", color: "bg-balatro-mult", name: "Mult" },
    { tag: "{C:white}", color: "bg-white-light", name: "White" },
    { tag: "{C:inactive}", color: "bg-gray-500", name: "Inactive" },
  ];

  const backgroundButtons = [
    { tag: "{X:red,C:white}", color: "bg-balatro-red", name: "Red BG" },
    { tag: "{X:blue,C:white}", color: "bg-balatro-blue", name: "Blue BG" },
    { tag: "{X:mult,C:white}", color: "bg-balatro-mult", name: "Mult BG" },
    { tag: "{X:chips,C:white}", color: "bg-balatro-chips", name: "Chips BG" },
    { tag: "{X:money,C:white}", color: "bg-balatro-money", name: "Money BG" },
  ];

  const rarityOptions = [
    { value: "1", label: "Common" },
    { value: "2", label: "Uncommon" },
    { value: "3", label: "Rare" },
    { value: "4", label: "Legendary" },
  ];

  const spawnPoolOptions = [
    { value: "shop", label: "Shop" },
    { value: "boss", label: "Boss" },
    { value: "ante", label: "Ante" },
    { value: "planet", label: "Planet" },
    { value: "spectral", label: "Spectral" },
  ];

  const getRarityColor = (rarity: number) => {
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

  const getRarityLabel = (rarity: number) => {
    switch (rarity) {
      case 1:
        return "Common";
      case 2:
        return "Uncommon";
      case 3:
        return "Rare";
      case 4:
        return "Legendary";
      default:
        return "Common";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-hidden">
      <div className="h-full flex">
        <div className="flex-1 w-3/4 overflow-y-auto custom-scrollbar">
          <div className="p-6 font-lexend">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl text-white-light font-light tracking-wide mb-1 bg-gradient-to-r from-white-light to-mint bg-clip-text">
                  Edit Joker
                </h1>
                <p className="text-white-darker text-sm">
                  Customize appearance, stats, and compatibility
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={<EyeIcon className="h-4 w-4" />}
                  size="sm"
                  title={showPreview ? "Hide preview" : "Show preview"}
                />
                <Button
                  variant="secondary"
                  onClick={onClose}
                  icon={<XMarkIcon className="h-4 w-4" />}
                  size="sm"
                  title="Close"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg text-white-light mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-mint" />
                  Visual Design
                </h2>

                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="aspect-[142/190] w-32 bg-black-darker border-2 border-black-lighter rounded-lg overflow-hidden">
                      {formData.imagePreview ? (
                        <img
                          src={formData.imagePreview}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white-darker">
                          <PhotoIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="secondary"
                      className="mt-2 w-full"
                      size="sm"
                      icon={<PhotoIcon className="h-3 w-3" />}
                    >
                      {formData.imagePreview ? "Change" : "Upload"}
                    </Button>
                    <p className="text-xs text-white-darker mt-1 text-center">
                      142×190px
                    </p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <InputField
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter joker name"
                      separator={true}
                      useGameFont={true}
                      label="Name"
                      size="md"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <InputDropdown
                        value={formData.rarity.toString()}
                        onChange={handleRarityChange}
                        options={rarityOptions}
                        separator={true}
                        label="Rarity"
                        size="sm"
                      />
                      <InputField
                        value={formData.cost?.toString() || "4"}
                        onChange={(e) =>
                          handleNumberChange("cost", parseInt(e.target.value))
                        }
                        placeholder="Cost"
                        separator={true}
                        type="number"
                        min={1}
                        label="Cost"
                        size="sm"
                      />
                      <InputDropdown
                        value={"shop"}
                        onChange={(value) => console.log(value)}
                        options={spawnPoolOptions}
                        separator={true}
                        label="Pool"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg text-white-light mb-4 flex items-center">
                  <PuzzlePieceIcon className="h-5 w-5 mr-2 text-mint" />
                  Properties
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-white-light mb-2">
                      Compatibility
                    </h3>
                    <div className="space-y-2 bg-black-darker p-3 rounded-lg border border-black-lighter">
                      <Checkbox
                        id="blueprint_compat_edit"
                        label="Blueprint"
                        checked={formData.blueprint_compat !== false}
                        onChange={(checked) =>
                          handleCheckboxChange("blueprint_compat", checked)
                        }
                        labelClassName="text-sm"
                      />
                      <Checkbox
                        id="eternal_compat_edit"
                        label="Eternal"
                        checked={formData.eternal_compat !== false}
                        onChange={(checked) =>
                          handleCheckboxChange("eternal_compat", checked)
                        }
                        labelClassName="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-white-light mb-2">
                      Availability
                    </h3>
                    <div className="space-y-2 bg-black-darker p-3 rounded-lg border border-black-lighter">
                      <Checkbox
                        id="unlocked_edit"
                        label="Unlocked"
                        checked={formData.unlocked !== false}
                        onChange={(checked) =>
                          handleCheckboxChange("unlocked", checked)
                        }
                        labelClassName="text-sm"
                      />
                      <Checkbox
                        id="discovered_edit"
                        label="Discovered"
                        checked={formData.discovered !== false}
                        onChange={(checked) =>
                          handleCheckboxChange("discovered", checked)
                        }
                        labelClassName="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg text-white-light mb-4 flex items-center">
                <HashtagIcon className="h-5 w-5 mr-2 text-mint" />
                Description & Formatting
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <InputField
                    id="joker-description-edit"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    multiline={true}
                    height="120px"
                    separator={true}
                    useGameFont={true}
                    label="Description"
                    placeholder="Describe your joker's effects..."
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-white-light mb-2">
                      Text Colors
                    </h4>
                    <div className="grid grid-cols-4 gap-1">
                      {colorButtons.slice(0, 8).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => insertTag(item.tag)}
                          title={item.name}
                          className={`w-6 h-6 ${item.color} rounded border border-black-lighter hover:scale-110 transition-transform`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-white-light mb-2">
                      Backgrounds
                    </h4>
                    <div className="grid grid-cols-4 gap-1">
                      {backgroundButtons.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => insertTag(item.tag)}
                          title={item.name}
                          className={`w-6 h-6 ${item.color} rounded border-2 border-white-light hover:scale-110 transition-transform`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => insertTag("[s]", false)}
                      icon={<ArrowPathIcon className="h-3 w-3" />}
                      fullWidth
                      className="text-xs"
                    >
                      New Line
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => insertTag("{s:1.1}")}
                      icon={<SparklesIcon className="h-3 w-3" />}
                      fullWidth
                      className="text-xs"
                    >
                      Scale Up
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => insertTag("{E:1}")}
                      icon={<BoltIcon className="h-3 w-3" />}
                      fullWidth
                      className="text-xs"
                    >
                      Float
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => insertTag("{}")}
                      fullWidth
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-black-lighter">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                icon={<TrashIcon className="h-4 w-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="w-1/4 bg-gradient-to-b from-black-dark to-black border-l-2 border-black-lighter p-6 overflow-y-auto">
            <div className="sticky top-0">
              <h2 className="text-lg text-white-light mb-4 text-center">
                Live Preview
              </h2>

              <div className="bg-gradient-to-br from-black-darker to-black border-2 border-black-lighter rounded-xl p-4 shadow-xl">
                <div className="flex flex-col items-center space-y-3">
                  <div className="aspect-[142/190] w-full max-w-[160px] bg-black border-2 border-black-lighter rounded-lg overflow-hidden">
                    {formData.imagePreview ? (
                      <img
                        src={formData.imagePreview}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white-darker">
                        <PhotoIcon className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    <h3 className="font-game text-lg text-white-light mb-2 tracking-wider">
                      {formData.name || "New Joker"}
                    </h3>

                    <div className="mb-3 text-sm">
                      <span
                        className={`font-medium ${getRarityColor(
                          formData.rarity
                        )}`}
                      >
                        {getRarityLabel(formData.rarity)}
                      </span>
                      <span className="text-white-darker mx-2">•</span>
                      <span className="text-balatro-money">
                        ${formData.cost || 4}
                      </span>
                    </div>

                    <div className="bg-black-dark p-3 rounded-lg border border-black-lighter min-h-[80px]">
                      <div className="font-game text-sm text-white-light leading-relaxed">
                        <BalatroText
                          text={
                            formData.description ||
                            "A custom joker with unique effects."
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-center space-x-3 text-xs">
                      {formData.blueprint_compat !== false && (
                        <div className="flex items-center text-balatro-blue">
                          <PuzzlePieceIcon className="h-3 w-3 mr-1" />
                          Blueprint
                        </div>
                      )}
                      {formData.eternal_compat !== false && (
                        <div className="flex items-center text-balatro-orange">
                          <LockOpenIcon className="h-3 w-3 mr-1" />
                          Eternal
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-black-darker rounded-lg border border-black-lighter">
                <h4 className="text-sm font-medium text-white-light mb-2">
                  Stats
                </h4>
                <div className="space-y-1 text-xs text-white-darker">
                  <div>Name: {formData.name?.length || 0} chars</div>
                  <div>Desc: {formData.description?.length || 0} chars</div>
                  <div>Rules: {formData.rules?.length || 0} defined</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditJokerInfo;
