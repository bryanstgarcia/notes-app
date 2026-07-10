import { CategoryColor } from "@/components/ui/ColorDropdown";

const CATEGORY_COLOR_CLASSES: Record<CategoryColor, string> = {
  blue: "bg-blue",
  yellow: "bg-yellow",
  green: "bg-green",
  orange: "bg-orange",
};

const DOT_SIZE_CLASSES = "w-3 h-3";

function ColorDot({ color }: { color: CategoryColor }) {
  return (
    <div
      className={`inline-block ${DOT_SIZE_CLASSES} rounded-full flex-shrink-0 ${CATEGORY_COLOR_CLASSES[color]}`}
      aria-hidden="true"
    />
  );
}

export interface CategoryListItemProps {
  color: CategoryColor | null;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  count?: number;
}

export function CategoryListItem({
  color,
  label,
  onClick,
  isActive = false,
  count,
}: CategoryListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer flex items-center justify-between gap-3 px-4 py-1 text-left font-sans text-base text-brown rounded-lg transition-colors duration-150 w-full ${
        isActive ? "font-bold" : "hover:bg-brown-light"
      }`}
    >
      <div className="flex items-center gap-3">
        {color && <ColorDot color={color} />}
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-sm text-brown/70">{count}</span>
      )}
    </button>
  );
}
