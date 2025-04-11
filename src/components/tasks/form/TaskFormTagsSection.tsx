
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

type TaskFormTagsSectionProps = {
  tags: string[];
  setTags: (tags: string[]) => void;
};

const TaskFormTagsSection: React.FC<TaskFormTagsSectionProps> = ({ tags, setTags }) => {
  const [tag, setTag] = useState<string>('');

  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim().toLowerCase())) {
      setTags([...tags, tag.trim().toLowerCase()]);
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#007bc4' }}>Etiquetas</CardTitle>
        <CardDescription>
          Engade etiquetas para categorizar esta tarefa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={`tag-${index}-${tag}`} variant="secondary" className="px-3 py-1 text-sm">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar etiqueta</span>
              </Button>
            </Badge>
          ))}
          
          {tags.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Non hai etiquetas aínda
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Engadir nova etiqueta"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
          </div>
          <Button type="button" size="sm" onClick={handleAddTag}>
            <Plus className="h-4 w-4 mr-1" />
            Engadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFormTagsSection;
