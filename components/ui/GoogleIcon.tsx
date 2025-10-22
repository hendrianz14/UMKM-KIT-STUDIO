'use client';

import type { IconBaseProps } from 'react-icons';
import { FcGoogle } from 'react-icons/fc';

const GoogleIcon = ({ className, ...rest }: IconBaseProps) => (
  <FcGoogle className={['mr-3 h-5 w-5', className].filter(Boolean).join(' ')} {...rest} />
);

export default GoogleIcon;
