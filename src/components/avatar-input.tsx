import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Camera, X } from "lucide-react";

interface AvatarInputProps {
  name: string;
  value: string | File | null | undefined;
  onChange: (file: string | File | null | undefined) => void;
  onBlur: () => void;
  disabled?: boolean | undefined;
}

export default function AvatarInput({
  name,
  value,
  onChange,
  onBlur,
  disabled,
}: AvatarInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const image =
    preview ||
    (typeof value === "string" ? value : null) ||
    "/avatar-default.svg";

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    onChange(file);
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  };

  const handleClear = () => {
    if (disabled) {
      return;
    }
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={image} />
          <AvatarFallback className="text-2xl">U</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Edit avatar"
          >
            <Camera className="size-2" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Clear avatar"
          >
            <X className="size-2" />
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onBlur={onBlur}
        onChange={handleChange}
      />
    </div>
  );
}
