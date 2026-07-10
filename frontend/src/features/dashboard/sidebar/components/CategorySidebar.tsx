import { CategoryColor } from "@/components/ui/ColorDropdown";
import { CategoryListItem } from "./CategoryListItem";

export interface CategorySidebarProps {
  heading: string;
  categories: {
    id: string;
    label: string;
    color: CategoryColor;
  }[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryCounts: Record<string, number>;
}

export function CategorySidebar({
  heading,
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts,
}: CategorySidebarProps) {
  return (
    <aside className="w-65">
      <ul className="flex flex-col gap-1">
        <li className="font-sans font-bold text-brown text-base">
          <CategoryListItem
            color={null}
            label={heading}
            onClick={() => onSelectCategory(null)}
            isActive={activeCategory === null}
          />
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryListItem
              color={category.color}
              label={category.label}
              onClick={() => onSelectCategory(category.id)}
              isActive={activeCategory === category.id}
              count={categoryCounts[category.id] || 0}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}
