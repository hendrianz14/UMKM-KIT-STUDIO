'use client';

import type { IconBaseProps } from 'react-icons';
import { FiEye } from 'react-icons/fi';

const EyeIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiEye className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default EyeIcon;
