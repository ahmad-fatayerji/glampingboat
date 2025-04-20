// src/components/LanguageDrop.tsx
"use client";

interface LanguageDropProps {
  code: string;
}

export default function LanguageDrop({ code }: LanguageDropProps) {
  return (
    <div
      className="
        relative 
        w-10 h-10         /* adjust size here */
        flex items-center justify-center 
        mx-1
      "
    >
      {/* background shape */}
      <img
        src="/svg/drop.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* language label */}
      <span className="relative text-[10px] font-medium text-[#002038]">
        {code}
      </span>
    </div>
  );
}
