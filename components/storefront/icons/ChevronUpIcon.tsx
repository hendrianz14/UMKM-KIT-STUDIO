'use client';

import type { IconBaseProps } from 'react-icons';
import { FiChevronUp } from 'react-icons/fi';

const ChevronUpIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiChevronUp className={['text-gray-500', className].filter(Boolean).join(' ')} {...rest} />
);

export default ChevronUpIcon;
