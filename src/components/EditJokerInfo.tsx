import React, { useState, useRef, useEffect } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  PencilIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import InputField from "./generic/InputField";
import InputDropdown from "./generic/InputDropdown";
import Checkbox from "./generic/Checkbox";
import Button from "./generic/Button";
import BalatroJokerCard from "./generic/BalatroJokerCard";
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
  const [activeTab, setActiveTab] = useState<"visual" | "description">(
    "visual"
  );
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...joker,
        blueprint_compat: joker.blueprint_compat !== false,
        eternal_compat: joker.eternal_compat !== false,
        unlocked: joker.unlocked !== false,
        discovered: joker.discovered !== false,
      });
      setPlaceholderError(false);
    }
  }, [isOpen, joker]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          handleSave();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 142 && img.height === 190) {
            setFormData({
              ...formData,
              overlayImagePreview: reader.result as string,
            });
          } else {
            alert(
              `Overlay image dimensions must be 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
            setPlaceholderError(false);
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

  const tabs = [
    { id: "visual", label: "Visual & Properties", icon: PhotoIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
  ];

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div className="flex items-start gap-8 max-h-[90vh]">
        {/* Main Edit Modal */}
        <div
          ref={modalRef}
          className="bg-black-dark border border-mint/30 rounded-xl w-[100vh] h-[90vh] flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black-lighter bg-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mint/10 rounded-lg border border-mint/20">
                <PencilIcon className="h-5 w-5 text-mint" />
              </div>
              <div>
                <h3 className="text-white-light text-lg font-medium">
                  Edit Joker
                </h3>
                <p className="text-white-darker text-sm">
                  Customize appearance and properties
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white-darker hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-black-lighter bg-black">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "visual" | "description")
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all relative border-b-2 ${
                    isActive
                      ? "text-mint-lighter bg-black-dark border-mint"
                      : "text-white-darker hover:text-white-light hover:bg-black-dark/50 border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {index < tabs.length - 1 && !isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-black-lighter"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {activeTab === "visual" && (
                <div className="p-4 space-y-6">
                  {/* Background Icons */}
                  <PuzzlePieceIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                        <PhotoIcon className="h-5 w-5 text-mint" />
                        Visual Assets
                      </h4>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="aspect-[142/190] w-60 rounded-lg overflow-hidden relative">
                            {formData.imagePreview ? (
                              <>
                                <img
                                  src={formData.imagePreview}
                                  alt={formData.name}
                                  className="w-full h-full object-cover"
                                  draggable="false"
                                />
                                {formData.overlayImagePreview && (
                                  <img
                                    src={formData.overlayImagePreview}
                                    alt={`${formData.name} overlay`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable="false"
                                  />
                                )}
                              </>
                            ) : !placeholderError ? (
                              <img
                                src="/images/placeholder-joker.png"
                                alt="Placeholder Joker"
                                className="w-full h-full object-cover"
                                draggable="false"
                                onError={() => setPlaceholderError(true)}
                              />
                            ) : (
                              <PhotoIcon className="h-16 w-16 text-white-darker opacity-50 mx-auto my-auto" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleOverlayImageUpload}
                            className="hidden"
                            ref={overlayFileInputRef}
                          />
                          <div className="space-y-2 mt-3">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={<PhotoIcon className="h-4 w-4" />}
                            >
                              {formData.imagePreview
                                ? "Change Main Image"
                                : "Upload Main Image"}
                            </Button>
                            <Button
                              onClick={() =>
                                overlayFileInputRef.current?.click()
                              }
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={<SparklesIcon className="h-4 w-4" />}
                            >
                              {formData.overlayImagePreview
                                ? "Change Overlay"
                                : "Add Overlay"}
                            </Button>
                            {formData.overlayImagePreview && (
                              <Button
                                onClick={() =>
                                  handleInputChange("overlayImagePreview", "")
                                }
                                variant="danger"
                                className="w-full"
                                size="sm"
                              >
                                Remove Overlay
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-white-darker mt-2 text-center">
                            Required: 142×190px each
                          </p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <InputField
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Enter joker name"
                            separator={true}
                            useGameFont={true}
                            label="Joker Name"
                            size="lg"
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <InputDropdown
                              value={formData.rarity.toString()}
                              onChange={handleRarityChange}
                              options={rarityOptions}
                              separator={true}
                              label="Rarity"
                            />
                            <InputField
                              value={formData.cost?.toString() || "4"}
                              onChange={(e) =>
                                handleNumberChange(
                                  "cost",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="Cost"
                              separator={true}
                              type="number"
                              min={1}
                              label="Cost ($)"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <Checkbox
                                id="blueprint_compat_edit"
                                label="Blueprint Compatible"
                                checked={formData.blueprint_compat !== false}
                                onChange={(checked) =>
                                  handleCheckboxChange(
                                    "blueprint_compat",
                                    checked
                                  )
                                }
                              />
                              <Checkbox
                                id="eternal_compat_edit"
                                label="Eternal Compatible"
                                checked={formData.eternal_compat !== false}
                                onChange={(checked) =>
                                  handleCheckboxChange(
                                    "eternal_compat",
                                    checked
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Checkbox
                                id="unlocked_edit"
                                label="Unlocked by Default"
                                checked={formData.unlocked !== false}
                                onChange={(checked) =>
                                  handleCheckboxChange("unlocked", checked)
                                }
                              />
                              <Checkbox
                                id="discovered_edit"
                                label="Already Discovered"
                                checked={formData.discovered !== false}
                                onChange={(checked) =>
                                  handleCheckboxChange("discovered", checked)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "description" && (
                <div className="p-6 space-y-6">
                  {/* Background Icons */}
                  <DocumentTextIcon className="absolute top-12 right-16 h-28 w-28 text-black-lighter/20 -rotate-6" />

                  <div className="bg-black-darker border border-black-lighter rounded-xl p-6">
                    <h4 className="text-white-light font-medium text-sm mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-mint" />
                      Formatting Tools
                    </h4>

                    <div className="space-y-6">
                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Text Colors
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {colorButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border border-black-lighter hover:scale-110 transition-transform`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Backgrounds
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {backgroundButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border-2 border-white-light hover:scale-110 transition-transform`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Special Effects
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("[s]", false)}
                            icon={<ArrowPathIcon className="h-3 w-3" />}
                          >
                            New Line
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{s:1.1}")}
                            icon={<SparklesIcon className="h-3 w-3" />}
                          >
                            Scale
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{E:1}")}
                            icon={<BoltIcon className="h-3 w-3" />}
                          >
                            Float
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{}")}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <InputField
                      id="joker-description-edit"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const value = textarea.value;
                          const newValue =
                            value.substring(0, start) +
                            "[s]" +
                            value.substring(end);
                          handleInputChange("description", newValue);

                          setTimeout(() => {
                            textarea.setSelectionRange(start + 3, start + 3);
                          }, 0);
                        }
                      }}
                      multiline={true}
                      height="180px"
                      separator={true}
                      useGameFont={true}
                      label="Description Text"
                      placeholder="Describe your joker's effects using Balatro formatting..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 p-6 border-t border-black-lighter bg-black">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={handleDelete} variant="danger" className="px-8">
              Delete
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-shrink-0 relative my-auto ">
          <div className="relative" style={{ zIndex: 1000 }}>
            <BalatroJokerCard joker={formData} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJokerInfo;
