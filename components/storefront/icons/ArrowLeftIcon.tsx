'use client';

import type { IconBaseProps } from 'react-icons';
import { FiArrowLeft } from 'react-icons/fi';

const ArrowLeftIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiArrowLeft className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default ArrowLeftIcon;
