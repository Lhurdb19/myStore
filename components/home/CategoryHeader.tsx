import { FC } from "react";

interface CategoryHeaderProps {
  title: string;
  description?: string;
}

const CategoryHeader: FC<CategoryHeaderProps> = ({ title, description }) => (
  <header className="py-8 text-center space-y-2">
    <h1 className="text-4xl font-bold">{title}</h1>
    {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
  </header>
);

export default CategoryHeader;
