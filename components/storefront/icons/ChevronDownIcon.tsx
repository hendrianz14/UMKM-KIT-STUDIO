'use client';

import type { IconBaseProps } from 'react-icons';
import { FiChevronDown } from 'react-icons/fi';

const ChevronDownIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiChevronDown className={['text-gray-500', className].filter(Boolean).join(' ')} {...rest} />
);

export default ChevronDownIcon;
