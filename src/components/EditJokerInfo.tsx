import React, { useState, useRef, useEffect } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  PencilIcon,
  CubeIcon,
  DocumentTextIcon,
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
  const [activeTab, setActiveTab] = useState<
    "visual" | "properties" | "description"
  >("visual");
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
    { id: "visual", label: "Visual", icon: PhotoIcon },
    { id: "properties", label: "Properties", icon: CubeIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
  ];

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div
        ref={modalRef}
        className="bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-3 border-b border-black-lighter">
          <div className="flex items-center gap-2">
            <PencilIcon className="h-5 w-5 text-white-light" />
            <h3 className="text-white-light text-sm font-medium tracking-wider">
              Edit Joker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-black-lighter">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as "visual" | "properties" | "description"
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium tracking-wider transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "text-mint border-b-2 border-mint bg-black-darker/50"
                        : "text-white-darker hover:text-white-light"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-6"></div>

              {activeTab === "visual" && (
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="aspect-[142/190] w-40 bg-black-darker border-2 border-black-lighter rounded-lg overflow-hidden relative">
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
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white-darker">
                            <PhotoIcon className="h-10 w-10" />
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
                          className="w-full cursor-pointer"
                          size="sm"
                          icon={<PhotoIcon className="h-4 w-4" />}
                        >
                          {formData.imagePreview
                            ? "Change Main Image"
                            : "Upload Main Image"}
                        </Button>
                        <Button
                          onClick={() => overlayFileInputRef.current?.click()}
                          variant={
                            formData.overlayImagePreview
                              ? "secondary"
                              : "secondary"
                          }
                          className="w-full cursor-pointer"
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
                            className="w-full cursor-pointer"
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
                        label="Name"
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
                            handleNumberChange("cost", parseInt(e.target.value))
                          }
                          placeholder="Cost"
                          separator={true}
                          type="number"
                          min={1}
                          label="Cost ($)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "properties" && (
                <div className="space-y-6">
                  <h1 className="text-balatro-red text-sm font-medium tracking-wider mb-4">
                    NOT IMPLEMENTED YET INTO CODE GEN, BARE WITH ME HAHA
                  </h1>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
                      <h4 className="text-white-light font-medium text-sm mb-4 tracking-wider">
                        COMPATIBILITY
                      </h4>
                      <div className="space-y-3">
                        <Checkbox
                          id="blueprint_compat_edit"
                          label="Blueprint Compatible"
                          checked={formData.blueprint_compat !== false}
                          onChange={(checked) =>
                            handleCheckboxChange("blueprint_compat", checked)
                          }
                        />
                        <Checkbox
                          id="eternal_compat_edit"
                          label="Eternal Compatible"
                          checked={formData.eternal_compat !== false}
                          onChange={(checked) =>
                            handleCheckboxChange("eternal_compat", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
                      <h4 className="text-white-light font-medium text-sm mb-4 tracking-wider">
                        AVAILABILITY
                      </h4>
                      <div className="space-y-3">
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
              )}

              {activeTab === "description" && (
                <div className="space-y-6">
                  <div className="bg-black-darker border border-black-lighter rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white-light font-medium text-sm tracking-wider">
                        FORMATTING TOOLS
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-white-darker text-xs mb-2">
                          Text Colors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {colorButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border border-black-lighter hover:scale-110 transition-transform cursor-pointer`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white-darker text-xs mb-2">
                          Backgrounds
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {backgroundButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border-2 border-white-light hover:scale-110 transition-transform cursor-pointer`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white-darker text-xs mb-2">
                          Special
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("[s]", false)}
                            icon={<ArrowPathIcon className="h-3 w-3" />}
                            className="cursor-pointer"
                          >
                            New Line
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{s:1.1}")}
                            icon={<SparklesIcon className="h-3 w-3" />}
                            className="cursor-pointer"
                          >
                            Scale
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{E:1}")}
                            icon={<BoltIcon className="h-3 w-3" />}
                            className="cursor-pointer"
                          >
                            Float
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{}")}
                            className="cursor-pointer"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <InputField
                    id="joker-description-edit"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    multiline={true}
                    height="200px"
                    separator={true}
                    useGameFont={true}
                    label="Description"
                    placeholder="Describe your joker's effects..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t border-black-lighter">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1 cursor-pointer"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                className="cursor-pointer"
              >
                Delete Joker
              </Button>
            </div>
          </div>

          <div className="w-96 border-l border-black-lighter overflow-y-auto flex items-center justify-center">
            <BalatroJokerCard joker={formData} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJokerInfo;
