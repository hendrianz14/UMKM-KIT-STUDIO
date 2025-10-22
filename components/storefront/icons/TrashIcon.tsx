'use client';

import type { IconBaseProps } from 'react-icons';
import { FiTrash2 } from 'react-icons/fi';

const TrashIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiTrash2 className={['text-red-600', className].filter(Boolean).join(' ')} {...rest} />
);

export default TrashIcon;
