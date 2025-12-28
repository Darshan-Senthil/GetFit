"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        alert("Please upload a JPG or PNG image");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-300 ease-out
        border-2 border-dashed p-8
        ${
          isDragging
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]"
            : "border-emerald-600/50 hover:border-emerald-500 hover:bg-emerald-500/5"
        }
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div
          className={`
          w-16 h-16 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isDragging ? "bg-emerald-500/30 scale-110" : "bg-emerald-500/20"}
        `}
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              isDragging ? "text-emerald-300" : "text-emerald-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <p className="text-lg font-semibold text-foreground">
            {isDragging ? "Drop your meal image here" : "Upload your meal image"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports JPG and PNG
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-2 border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          disabled={disabled}
        >
          Choose File
        </Button>
      </div>
    </Card>
  );
}

