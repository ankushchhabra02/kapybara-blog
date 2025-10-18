"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

type CloudinaryUploaderProps = {
  onUpload: (url: string) => void;
};

export default function CloudinaryUploader({
  onUpload,
}: CloudinaryUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <CldUploadWidget
        uploadPreset="unsigned_preset" // ✅ replace with your actual preset
        onSuccess={(result: any) => {
          const url = result?.info?.secure_url;
          console.log("✅ Cloudinary Uploaded URL:", url); // 👈 debug check
          if (url) {
            setImageUrl(url);
            onUpload(url);
          }
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Upload Image
          </button>
        )}
      </CldUploadWidget>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Preview"
          className="w-64 h-40 object-cover rounded-lg shadow"
        />
      )}
    </div>
  );
}
