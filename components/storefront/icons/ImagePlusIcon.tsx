'use client';

import type { IconBaseProps } from 'react-icons';
import { FiImage } from 'react-icons/fi';

const ImagePlusIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiImage className={['text-gray-400', className].filter(Boolean).join(' ')} {...rest} />
);

export default ImagePlusIcon;
