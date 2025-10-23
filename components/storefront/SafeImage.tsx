'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK_SVG = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='18'>No Image</text></svg>"
);

const FALLBACK_SRC = `data:image/svg+xml;utf8,${FALLBACK_SVG}`;

export default function SafeImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  const { src, alt, onError, ...rest } = props;

  return (
    <Image
      {...rest}
      src={failed ? FALLBACK_SRC : src}
      alt={alt}
      onError={(e) => {
        setFailed(true);
        onError?.(e as any);
      }}
    />
  );
}

