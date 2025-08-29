import { Category } from "@/types/category";
import { FileText, FolderTree } from "lucide-react";
import AddCategoryModal from "./add-modal";
import EditCategoryModal from "./edit-modal";
import DeleteCategory from "./delete-modal";

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 group hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <FolderTree className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              {category.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditCategoryModal category={category} />
            <DeleteCategory category={category} />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {category.subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg group hover:bg-gray-50"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">{subcategory.name}</span>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditCategoryModal category={subcategory as Category} />
              <DeleteCategory category={subcategory as Category} />
            </div>
          </div>
        ))}
        <AddCategoryModal category={category} />
      </div>
    </div>
  );
};

export default CategoryCard;
