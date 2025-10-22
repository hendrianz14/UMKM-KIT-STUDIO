'use client';

import type { IconBaseProps } from 'react-icons';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppIcon = ({ className, ...rest }: IconBaseProps) => (
  <FaWhatsapp className={['text-white', className].filter(Boolean).join(' ')} {...rest} />
);

export default WhatsAppIcon;
