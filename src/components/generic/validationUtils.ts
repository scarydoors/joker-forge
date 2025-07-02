export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateJokerName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Name cannot be empty" };
  }

  if (name.includes('"') || name.includes("'")) {
    return { isValid: false, error: "Name cannot contain quotation marks" };
  }

  if (name.includes("\\")) {
    return { isValid: false, error: "Name cannot contain backslashes" };
  }

  if (name.includes("\n") || name.includes("\r")) {
    return { isValid: false, error: "Name cannot contain line breaks" };
  }

  if (name.includes("`")) {
    return { isValid: false, error: "Name cannot contain backticks" };
  }

  return { isValid: true };
};

export const validateVariableName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Variable name cannot be empty" };
  }

  if (name.includes(" ")) {
    return { isValid: false, error: "Variable name cannot contain spaces" };
  }

  if (name.includes('"') || name.includes("'")) {
    return {
      isValid: false,
      error: "Variable name cannot contain quotation marks",
    };
  }

  if (name.includes("\\")) {
    return {
      isValid: false,
      error: "Variable name cannot contain backslashes",
    };
  }

  if (name.includes("`")) {
    return { isValid: false, error: "Variable name cannot contain backticks" };
  }

  if (/^\d/.test(name)) {
    return {
      isValid: false,
      error: "Variable name cannot start with a number",
    };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return {
      isValid: false,
      error: "Variable name can only contain letters, numbers, and underscores",
    };
  }

  const reservedWords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "true",
    "false",
    "null",
    "undefined",
  ];

  if (reservedWords.includes(name.toLowerCase())) {
    return { isValid: false, error: "Variable name cannot be a reserved word" };
  }

  if (name.length > 30) {
    return {
      isValid: false,
      error: "Variable name must be 30 characters or less",
    };
  }

  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  if (description.includes("\\") && !description.includes("\\\\")) {
    return { isValid: false, error: "Unescaped backslashes may cause issues" };
  }

  return { isValid: true };
};

export const validateCustomMessage = (message: string): ValidationResult => {
  if (message.includes('"') || message.includes("'")) {
    return { isValid: false, error: "Message cannot contain quotation marks" };
  }

  if (message.includes("\\") && !message.includes("\\\\")) {
    return { isValid: false, error: "Unescaped backslashes may cause issues" };
  }

  if (message.includes("`")) {
    return { isValid: false, error: "Message cannot contain backticks" };
  }

  if (message.includes("\n") || message.includes("\r")) {
    return { isValid: false, error: "Message cannot contain line breaks" };
  }

  if (message.length > 100) {
    return { isValid: false, error: "Message must be 100 characters or less" };
  }

  return { isValid: true };
};
