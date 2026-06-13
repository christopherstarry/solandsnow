"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  size = 48,
  className = "",
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-xl bg-cream-dark text-xs font-bold text-wood-dark ring-1 ring-wood/10 ${className}`}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`flex-shrink-0 rounded-xl bg-cream object-cover ring-1 ring-wood/10 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
