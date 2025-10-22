'use client';

import type { IconBaseProps } from 'react-icons';
import { FiHome } from 'react-icons/fi';

const HomeIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiHome className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default HomeIcon;
