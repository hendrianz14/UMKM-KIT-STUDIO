'use client';

import type { IconBaseProps } from 'react-icons';
import { LuStore } from 'react-icons/lu';

const StorefrontIcon = ({ className, ...rest }: IconBaseProps) => (
  <LuStore className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default StorefrontIcon;
