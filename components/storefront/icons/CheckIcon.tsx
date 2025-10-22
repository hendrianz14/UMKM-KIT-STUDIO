'use client';

import type { IconBaseProps } from 'react-icons';
import { FiCheck } from 'react-icons/fi';

const CheckIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiCheck className={['text-white', className].filter(Boolean).join(' ')} {...rest} />
);

export default CheckIcon;
