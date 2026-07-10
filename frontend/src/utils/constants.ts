import { CategoryColor } from "@/components/ui/ColorDropdown";

export const PLACEHOLDER_CATEGORIES: {
    id: string;
    label: string;
    color: CategoryColor;
}[] = [
    { id: "random-thoughts", label: "Random Thoughts", color: "orange" },
    { id: "school", label: "School", color: "yellow" },
    { id: "personal", label: "Personal", color: "blue" },
];
