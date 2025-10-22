'use client';

import type { IconBaseProps } from 'react-icons';
import { FiMenu } from 'react-icons/fi';

const MenuIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiMenu className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default MenuIcon;
