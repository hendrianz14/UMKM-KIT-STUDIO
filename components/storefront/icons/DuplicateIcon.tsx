'use client';

import type { IconBaseProps } from 'react-icons';
import { FiCopy } from 'react-icons/fi';

const DuplicateIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiCopy className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default DuplicateIcon;
