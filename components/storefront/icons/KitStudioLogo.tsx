'use client';

import Image from 'next/image';

type Props = {
  className?: string;
};

const KitStudioLogo = ({ className }: Props) => (
  <Image
    src="/umkmkitstudio.png"
    alt="UMKM KitStudio"
    width={24}
    height={24}
    className={["h-6 w-6", className].filter(Boolean).join(' ')}
    priority={false}
  />
);

export default KitStudioLogo;
