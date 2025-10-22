'use client';

import React, { ReactNode } from 'react';

interface ProductsLayoutClientProps {
  list: ReactNode;
  editor: ReactNode;
}

const ProductsLayoutClient: React.FC<ProductsLayoutClientProps> = ({ list, editor }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section className="space-y-4">{list}</section>
      <aside className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">{editor}</aside>
    </div>
  );
};

export default ProductsLayoutClient;

