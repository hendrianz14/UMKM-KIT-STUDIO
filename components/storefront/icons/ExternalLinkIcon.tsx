'use client';

import type { IconBaseProps } from 'react-icons';
import { FiExternalLink } from 'react-icons/fi';

const ExternalLinkIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiExternalLink className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default ExternalLinkIcon;
