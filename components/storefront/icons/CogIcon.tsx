'use client';

import type { IconBaseProps } from 'react-icons';
import { FiSettings } from 'react-icons/fi';

const CogIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiSettings className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default CogIcon;
