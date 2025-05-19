import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import React from "react";
import { toast } from "react-hot-toast";

type ImageInputProps = {
  title: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  endpoint: "clientProfileImage" | "categoryImage";
};

export default function ImageInput({
  title,
  imageUrl,
  setImageUrl,
  endpoint,
}: ImageInputProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
        <Image
          alt={title}
          className="object-cover"
          src={imageUrl}
          fill
          priority
        />
      </div>
      <div className="flex flex-col gap-2">
        <UploadButton
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (res && res[0]?.url) {
              setImageUrl(res[0].url);
              toast.success("Image uploaded successfully");
            }
          }}
          onUploadError={(error: Error) => {
            if (error.message.includes("FileSizeMismatch")) {
              toast.error("File size too large. Maximum size is 4MB");
            } else if (error.message.includes("InvalidFileType")) {
              toast.error("Invalid file type. Please upload an image file");
            } else {
              toast.error(`Upload failed: ${error.message}`);
            }
          }}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Upload a profile picture for the client. Supported formats: JPG, PNG, GIF. Max file size: 4MB
        </p>
      </div>
    </div>
  );
}
