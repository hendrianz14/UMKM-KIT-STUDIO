'use client';

import type { IconBaseProps } from 'react-icons';
import { FiStar } from 'react-icons/fi';

const StarIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiStar className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default StarIcon;
