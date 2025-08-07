import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import { EnhancementData, slugify } from "../../data/BalatroUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "../../generic/validationUtils";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";

interface EditEnhancementInfoProps {
  isOpen: boolean;
  enhancement: EnhancementData;
  onClose: () => void;
  onSave: (enhancement: EnhancementData) => void;
  onDelete: (enhancementId: string) => void;
  modPrefix: string;
  showConfirmation: (options: {
    type?: "default" | "warning" | "danger" | "success";
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

const EditEnhancementInfo: React.FC<EditEnhancementInfoProps> = ({
  isOpen,
  enhancement,
  onClose,
  onSave,
  onDelete,
  showConfirmation,
}) => {
  const [formData, setFormData] = useState<EnhancementData>(enhancement);
  const [activeTab, setActiveTab] = useState<"visual" | "description">(
    "visual"
  );
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [lastFormattedText, setLastFormattedText] = useState<string>("");

  const [placeholderCredits, setPlaceholderCredits] = useState<
    Record<number, string>
  >({});

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

  const validateField = (field: string, value: string) => {
    let result: ValidationResult;
    switch (field) {
      case "name":
        result = validateJokerName(value);
        break;
      case "description":
        result = validateDescription(value);
        break;
      default:
        return;
    }

    setValidationResults((prev) => ({
      ...prev,
      [field]: result,
    }));
  };

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch(
          "/images/placeholderenhancements/credit.txt"
        );
        const text = await response.text();
        console.log("Raw credit file content:", JSON.stringify(text));

        const credits: Record<number, string> = {};

        text.split("\n").forEach((line, lineIndex) => {
          const trimmed = line.trim();
          console.log(`Line ${lineIndex}: "${trimmed}"`);

          if (trimmed && trimmed.includes(":")) {
            const [indexStr, nameStr] = trimmed.split(":");
            const index = indexStr?.trim();
            const name = nameStr?.trim();

            if (index && name) {
              const indexNum = parseInt(index);
              if (!isNaN(indexNum)) {
                credits[indexNum] = name;
              }
            }
          }
        });

        setPlaceholderCredits(credits);
      } catch (error) {
        console.error("Failed to load placeholder credits:", error);
      }
    };

    loadCredits();
  }, []);

  const handleSave = useCallback(() => {
    const nameValidation = validateJokerName(formData.name);
    const descValidation = validateDescription(formData.description);

    if (!nameValidation.isValid || !descValidation.isValid) {
      setValidationResults({
        name: nameValidation,
        description: descValidation,
      });
      return;
    }

    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...enhancement,
        unlocked: enhancement.unlocked !== false,
        discovered: enhancement.discovered !== false,
        no_collection: enhancement.no_collection === true,
        any_suit: enhancement.any_suit === true,
        replace_base_card: enhancement.replace_base_card === true,
        no_rank: enhancement.no_rank === true,
        no_suit: enhancement.no_suit === true,
        always_scores: enhancement.always_scores === true,
        enhancementKey: enhancement.enhancementKey || slugify(enhancement.name),
        hasUserUploadedImage: enhancement.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(enhancement.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, enhancement]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, handleSave]);

  if (!isOpen) return null;

  const toggleUndo = () => {
    const currentDesc = formData.description;
    handleInputChange("description", lastDescription, false);
    setLastDescription(currentDesc);
  };

  const parseTag = (tag: string): Record<string, string> => {
    const content = tag.slice(1, -1);
    if (!content) return {};

    const modifiers: Record<string, string> = {};
    const parts = content.split(",");

    for (const part of parts) {
      const [key, value] = part.split(":");
      if (key && value) {
        modifiers[key.trim()] = value.trim();
      }
    }

    return modifiers;
  };

  const buildTag = (modifiers: Record<string, string>): string => {
    if (Object.keys(modifiers).length === 0) return "{}";

    const parts = Object.entries(modifiers).map(
      ([key, value]) => `${key}:${value}`
    );
    return `{${parts.join(",")}}`;
  };

  const colorButtons = [
    { tag: "{C:red}", color: "bg-balatro-red", name: "Red" },
    { tag: "{C:blue}", color: "bg-balatro-blue", name: "Blue" },
    { tag: "{C:green}", color: "bg-balatro-green", name: "Green" },
    { tag: "{C:purple}", color: "bg-balatro-purple", name: "Purple" },
    { tag: "{C:attention}", color: "bg-balatro-orange", name: "Orange" },
    { tag: "{C:money}", color: "bg-balatro-money", name: "Money" },
    { tag: "{C:gold}", color: "bg-balatro-gold-new", name: "Gold" },
    { tag: "{C:white}", color: "bg-balatro-white", name: "White" },
    { tag: "{C:inactive}", color: "bg-balatro-grey", name: "Inactive" },
    { tag: "{C:default}", color: "bg-balatro-default", name: "Default" },
    { tag: "{C:hearts}", color: "bg-balatro-hearts", name: "Hearts" },
    { tag: "{C:clubs}", color: "bg-balatro-clubs", name: "Clubs" },
    { tag: "{C:diamonds}", color: "bg-balatro-diamonds", name: "Diamonds" },
    { tag: "{C:spades}", color: "bg-balatro-spades", name: "Spades" },
    { tag: "{C:enhanced}", color: "bg-balatro-enhanced-new", name: "Enhanced" },
    {
      tag: "{C:edition}",
      color: "bg-gradient-to-r from-purple-400 to-pink-400",
      name: "Edition",
    },
    {
      tag: "{C:dark_edition}",
      color: "bg-gray-900 border-2 border-purple-400",
      name: "Dark Edition",
    },
  ];

  const backgroundButtons = [
    { tag: "{X:red,C:white}", color: "bg-balatro-red", name: "Red BG" },
    { tag: "{X:blue,C:white}", color: "bg-balatro-blue", name: "Blue BG" },
    { tag: "{X:mult,C:white}", color: "bg-balatro-mult", name: "Mult BG" },
    { tag: "{X:chips,C:white}", color: "bg-balatro-chips", name: "Chips BG" },
    { tag: "{X:money,C:white}", color: "bg-balatro-money", name: "Money BG" },
    {
      tag: "{X:attention,C:white}",
      color: "bg-balatro-orange",
      name: "Attention BG",
    },
    {
      tag: "{X:enhanced,C:white}",
      color: "bg-balatro-enhanced-new",
      name: "Enhanced BG",
    },
    {
      tag: "{X:edition,C:white}",
      color: "bg-gradient-to-r from-purple-400 to-pink-400",
      name: "Edition BG",
    },
  ];

  const handleInputChange = (
    field: string,
    value: string,
    shouldAutoFormat: boolean = true
  ) => {
    let finalValue = value;

    if (field === "description" && shouldAutoFormat) {
      const result = applyAutoFormatting(
        value,
        lastFormattedText,
        autoFormatEnabled,
        false
      );
      finalValue = result.formatted;

      if (result.hasChanges) {
        setLastFormattedText(finalValue);
      }

      setFormData({
        ...formData,
        [field]: finalValue,
      });
    } else if (field === "name") {
      setFormData({
        ...formData,
        [field]: value,
        enhancementKey: slugify(value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    validateField(field, finalValue);
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    });
  };

  const upscaleImage = (img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 142;
    canvas.height = 190;

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 142, 190);
    }

    return canvas.toDataURL("image/png");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let finalImageData: string;

          if (
            (img.width === 71 && img.height === 95) ||
            (img.width === 142 && img.height === 190)
          ) {
            if (img.width === 71 && img.height === 95) {
              finalImageData = upscaleImage(img);
            } else {
              finalImageData = reader.result as string;
            }

            setFormData({
              ...formData,
              imagePreview: finalImageData,
              hasUserUploadedImage: true,
            });
            setPlaceholderError(false);
          } else {
            alert(
              `Image dimensions must be either 71x95 or 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageCredit = (enhancement: EnhancementData): string | null => {
    if (enhancement.hasUserUploadedImage) {
      return null;
    }

    if (
      enhancement.placeholderCreditIndex &&
      placeholderCredits[enhancement.placeholderCreditIndex]
    ) {
      return placeholderCredits[enhancement.placeholderCreditIndex];
    }
    return null;
  };

  const handleDelete = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Enhancement",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(enhancement.id);
        onClose();
      },
    });
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "enhancement-description-edit"
    ) as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const currentValue = textArea.value;
    const selectedText = currentValue.substring(startPos, endPos);

    setLastDescription(currentValue);
    setLastFormattedText(currentValue);

    let newText: string;
    let newCursorPos: number;

    const tagMatch = selectedText.match(/^(\{[^}]*\})(.*?)(\{\})$/);

    if (tagMatch) {
      const [, openTag, content, closeTag] = tagMatch;
      const modifiers = parseTag(openTag);

      const newTagContent = tag.slice(1, -1);
      const [newKey, newValue] = newTagContent.split(":");

      if (newKey && newValue) {
        modifiers[newKey] = newValue;
      }

      const newOpenTag = buildTag(modifiers);
      const newSelectedText = `${newOpenTag}${content}${closeTag}`;

      newText =
        currentValue.substring(0, startPos) +
        newSelectedText +
        currentValue.substring(endPos);
      newCursorPos = startPos + newOpenTag.length + content.length + 2;
    } else if (selectedText) {
      if (autoClose) {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          selectedText +
          "{}" +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length + selectedText.length + 2;
      } else {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          selectedText +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length + selectedText.length;
      }
    } else {
      if (autoClose) {
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
    }

    handleInputChange("description", newText, false);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertTag = (tag: string, autoClose: boolean = true) => {
    insertTagSmart(tag, autoClose);
  };

  const tabs = [
    { id: "visual", label: "Visual & Properties", icon: PhotoIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
  ];

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") {
        e.preventDefault();
        toggleUndo();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "[s]" + value.substring(end);

      setLastDescription(value);
      setLastFormattedText(value);
      handleInputChange("description", newValue, false);

      setTimeout(() => {
        textarea.setSelectionRange(start + 3, start + 3);
      }, 0);
    }
  };

  const getValidationMessage = (field: "name" | "description") => {
    const result = validationResults[field];
    if (!result) return null;

    if (!result.isValid && result.error) {
      return {
        type: "error" as const,
        message: result.error,
        icon: ExclamationTriangleIcon,
      };
    }

    if (result.isValid && result.warning) {
      return {
        type: "warning" as const,
        message: result.warning,
        icon: InformationCircleIcon,
      };
    }

    return null;
  };

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div ref={modalRef} className="flex items-start gap-8 max-h-[90vh]">
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg w-[100vh] h-[90vh] flex flex-col relative overflow-hidden">
          <div className="flex ">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "visual" | "description")
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-black transition-all relative border-b-2 ${
                    isActive
                      ? "text-mint-lighter bg-black-dark border-mint"
                      : "text-white-darker hover:text-white-light hover:bg-black-dark border-b-2 border-black-lighter"
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

          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {activeTab === "visual" && (
                <div className="p-6 space-y-6">
                  <PuzzlePieceIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

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
                              <img
                                src={formData.imagePreview}
                                alt={formData.name}
                                className="w-full h-full object-cover"
                                draggable="false"
                                onError={() => setPlaceholderError(true)}
                              />
                            ) : !placeholderError ? (
                              <img
                                src={
                                  !fallbackAttempted
                                    ? "/images/placeholderenhancements/placeholder-enhancement.png"
                                    : "/images/placeholder-enhancement.png"
                                }
                                alt="Placeholder Enhancement"
                                className="w-full h-full object-cover"
                                draggable="false"
                                onError={() => {
                                  if (!fallbackAttempted) {
                                    setFallbackAttempted(true);
                                  } else {
                                    setPlaceholderError(true);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="h-16 w-16 text-white-darker opacity-50" />
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
                          <div className="space-y-2 mt-3">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={<PhotoIcon className="h-4 w-4" />}
                            >
                              {formData.imagePreview
                                ? "Change Image"
                                : "Upload Image"}
                            </Button>
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-white-darker">
                              Accepted: 71×95px or 142×190px
                            </p>
                            {(() => {
                              const credit = getImageCredit(formData);
                              return credit ? (
                                <p className="text-xs text-white-darker mt-1">
                                  Credit: {credit}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <InputField
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value, false)
                              }
                              placeholder="Enter enhancement name"
                              separator={true}
                              label="Enhancement Name"
                              size="md"
                              error={
                                getValidationMessage("name")?.type === "error"
                                  ? getValidationMessage("name")?.message
                                  : undefined
                              }
                            />
                          </div>
                          <InputField
                            value={formData.enhancementKey || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "enhancementKey",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="Enter enhancement key"
                            separator={true}
                            label="Enhancement Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Enhancement Properties
                            </h4>
                            <div className="space-y-4 rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Default State
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
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
                                      handleCheckboxChange(
                                        "discovered",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="no_collection_edit"
                                    label="Hidden from Collection"
                                    checked={formData.no_collection === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "no_collection",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Card Properties
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="any_suit_edit"
                                    label="Works with Any Suit"
                                    checked={formData.any_suit === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("any_suit", checked)
                                    }
                                  />
                                  <Checkbox
                                    id="replace_base_card_edit"
                                    label="Replaces Base Card"
                                    checked={
                                      formData.replace_base_card === true
                                    }
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "replace_base_card",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="always_scores_edit"
                                    label="Always Scores"
                                    checked={formData.always_scores === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "always_scores",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Rank & Suit Behavior
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="no_rank_edit"
                                    label="Remove Rank"
                                    checked={formData.no_rank === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("no_rank", checked)
                                    }
                                  />
                                  <Checkbox
                                    id="no_suit_edit"
                                    label="Remove Suit"
                                    checked={formData.no_suit === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("no_suit", checked)
                                    }
                                  />
                                </div>
                              </div>
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
                  <DocumentTextIcon className="absolute top-12 right-16 h-28 w-28 text-black-lighter/20 -rotate-6 pointer-events-none" />

                  <div className="bg-black-darker border border-black-lighter rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white-light font-medium text-sm flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4 text-mint" />
                        Formatting Tools
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white-darker">
                          Ctrl+Z to undo
                        </span>
                        <Button
                          size="sm"
                          variant={autoFormatEnabled ? "primary" : "secondary"}
                          onClick={() =>
                            setAutoFormatEnabled(!autoFormatEnabled)
                          }
                          icon={<SparklesIcon className="h-3 w-3" />}
                        >
                          Auto Format
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
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
                              className={`w-8 h-8 ${item.color} rounded border border-black-lighter hover:scale-110 transition-transform z-10`}
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

                  <div className="w-full -mt-2">
                    <InputField
                      id="enhancement-description-edit"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      multiline={true}
                      height="140px"
                      separator={true}
                      label="Description Text"
                      placeholder="Describe your enhancement's effects using Balatro formatting..."
                    />
                    {(() => {
                      const validationMsg = getValidationMessage("description");
                      return validationMsg ? (
                        <div
                          className={`flex items-center gap-2 mt-1 text-sm ${
                            validationMsg.type === "error"
                              ? "text-balatro-orange"
                              : "text-yellow-500"
                          }`}
                        >
                          <validationMsg.icon className="h-4 w-4" />
                          <span>{validationMsg.message}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 p-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              onTouchEnd={handleDelete}
              variant="danger"
              className="px-8"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 relative my-auto pb-40">
          <div className="relative pl-24" style={{ zIndex: 1000 }}>
            <BalatroCard
              type="card"
              data={{
                id: formData.id,
                name: formData.name,
                description: formData.description,
                imagePreview: formData.imagePreview,
              }}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEnhancementInfo;
