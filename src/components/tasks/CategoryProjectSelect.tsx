
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getAllCategories, getProjectsByCategory } from '@/utils/categoryProjectData';
import { Folder, ListTodo } from 'lucide-react';

interface CategoryProjectSelectProps {
  category: string;
  project: string;
  onCategoryChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  className?: string;
}

export const CategoryProjectSelect: React.FC<CategoryProjectSelectProps> = ({
  category,
  project,
  onCategoryChange,
  onProjectChange,
  className
}) => {
  const [categories] = useState<string[]>(getAllCategories());
  const [projects, setProjects] = useState<string[]>([]);
  
  // Update projects when category changes
  useEffect(() => {
    if (category) {
      const categoryProjects = getProjectsByCategory(category);
      setProjects(categoryProjects);
      
      // Reset project if it's not in the new category's projects list
      if (project && !categoryProjects.includes(project)) {
        onProjectChange('');
      }
    } else {
      setProjects([]);
    }
  }, [category, project, onProjectChange]);

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center">
          <Folder className="mr-1 h-4 w-4 text-primary/70" />
          Categoría
        </Label>
        <Select 
          value={category} 
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">-- Seleccionar categoría --</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="project" className="flex items-center">
          <ListTodo className="mr-1 h-4 w-4 text-primary/70" />
          Proyecto
        </Label>
        <Select 
          value={project} 
          onValueChange={onProjectChange}
          disabled={!category}
        >
          <SelectTrigger>
            <SelectValue placeholder={category ? "Seleccionar proyecto" : "Selecciona categoría primeiro"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">-- Seleccionar proyecto --</SelectItem>
            {projects.map((proj) => (
              <SelectItem key={proj} value={proj}>
                {proj}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
