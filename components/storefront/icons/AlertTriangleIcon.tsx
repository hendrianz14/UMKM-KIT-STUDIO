'use client';

import type { IconBaseProps } from 'react-icons';
import { FiAlertTriangle } from 'react-icons/fi';

const AlertTriangleIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiAlertTriangle className={['text-amber-500', className].filter(Boolean).join(' ')} {...rest} />
);

export default AlertTriangleIcon;
