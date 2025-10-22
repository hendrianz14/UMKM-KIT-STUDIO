'use client';

import type { IconBaseProps } from 'react-icons';
import { FiEdit2 } from 'react-icons/fi';

const EditIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiEdit2 className={['text-current', className].filter(Boolean).join(' ')} {...rest} />
);

export default EditIcon;
