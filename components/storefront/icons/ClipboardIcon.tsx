'use client';

import type { IconBaseProps } from 'react-icons';
import { FiClipboard } from 'react-icons/fi';

const ClipboardIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiClipboard className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default ClipboardIcon;
