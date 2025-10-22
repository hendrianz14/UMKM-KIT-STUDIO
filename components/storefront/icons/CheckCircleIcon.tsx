'use client';

import type { IconBaseProps } from 'react-icons';
import { FiCheckCircle } from 'react-icons/fi';

const CheckCircleIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiCheckCircle className={['text-white', className].filter(Boolean).join(' ')} {...rest} />
);

export default CheckCircleIcon;
