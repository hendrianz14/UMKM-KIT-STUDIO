'use client';

import type { IconBaseProps } from 'react-icons';
import { FiShoppingCart } from 'react-icons/fi';

const CartIcon = ({ className, ...rest }: IconBaseProps) => (
  <FiShoppingCart
    className={['text-gray-700', className].filter(Boolean).join(' ')}
    {...rest}
  />
);

export default CartIcon;
