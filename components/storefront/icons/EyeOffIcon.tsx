'use client';

import type { IconBaseProps } from 'react-icons';
import { FiEyeOff } from 'react-icons/fi';

const EyeOffIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiEyeOff className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default EyeOffIcon;
