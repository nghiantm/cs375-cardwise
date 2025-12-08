type CategoryOption = {
  value: string;
  label: string;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "all", label: "General" },
  { value: "dining", label: "Dining" },
  { value: "grocery", label: "Grocery" },
  { value: "travel", label: "Travel" },
  { value: "gas", label: "Gas" },
  { value: "online", label: "Online Shopping" },
];

export class CategoryHelper {
  static getCategories(): CategoryOption[] {
    return CATEGORY_OPTIONS;
  }

  static getDefaultCategory(): string {
    return CATEGORY_OPTIONS[0]?.value ?? "dining";
  }

  static formatLabel(value: string): string {
    const match = CATEGORY_OPTIONS.find((c) => c.value === value);
    if (match) return match.label;
    // fallback: convert snake_case to Title Case
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
