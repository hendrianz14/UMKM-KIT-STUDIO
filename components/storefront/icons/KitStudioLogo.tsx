'use client';

import type { IconBaseProps } from 'react-icons';
import { FiHexagon } from 'react-icons/fi';

const KitStudioLogo = ({ className, ...rest }: IconBaseProps) => (
  <FiHexagon className={['h-6 w-6 text-gray-400', className].filter(Boolean).join(' ')} {...rest} />
);

export default KitStudioLogo;
