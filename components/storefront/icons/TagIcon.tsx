'use client';

import type { IconBaseProps } from 'react-icons';
import { FiTag } from 'react-icons/fi';

const TagIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiTag className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default TagIcon;
