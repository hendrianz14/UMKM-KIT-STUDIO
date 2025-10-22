'use client';

import KitStudioLogo from './icons/KitStudioLogo';

const StorefrontFooter = () => (
  <footer className="mt-12 border-t bg-light">
    <div className="container mx-auto flex items-center justify-center px-4 py-6 text-gray-500">
      <a
        href="https://aistudio.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 transition hover:text-gray-700"
      >
        <KitStudioLogo />
        <span className="text-sm">Halaman ini dibuat di UMKM KitStudio</span>
      </a>
    </div>
  </footer>
);

export default StorefrontFooter;
