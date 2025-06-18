import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Eye } from "lucide-react";

interface PhotoUploadProps {
  onPhotosChange?: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          
          if (newPhotos.length === files.length) {
            const updatedPhotos = [...photos, ...newPhotos].slice(0, maxPhotos);
            setPhotos(updatedPhotos);
            onPhotosChange?.(updatedPhotos);
            
            if (files.length > maxPhotos - photos.length) {
              toast({
                title: "Photo limit reached",
                description: `Only ${maxPhotos} photos allowed. Some photos were not added.`,
                variant: "destructive"
              });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors cursor-pointer"
        onClick={triggerFileInput}
      >
        <CardContent className="p-8 text-center">
          <Camera className="mx-auto mb-4 text-slate-400" size={48} />
          <h3 className="text-lg font-medium mb-2">Upload Job Photos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Take before/after photos or upload from gallery
          </p>
          <Button variant="outline" className="mb-2">
            <Upload className="mr-2" size={16} />
            Choose Photos
          </Button>
          <p className="text-xs text-muted-foreground">
            {photos.length}/{maxPhotos} photos uploaded
          </p>
        </CardContent>
      </Card>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                  src={photo}
                  alt={`Job photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Photo Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                >
                  <Eye size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Full size photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
