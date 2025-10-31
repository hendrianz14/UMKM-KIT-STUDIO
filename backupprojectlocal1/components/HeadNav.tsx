'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.43L19.57 9L12 13.57L4.43 9L12 4.43ZM3.5 8.09L12 12.91V20L3.5 15.18V8.09ZM20.5 15.18L12 20V12.91L20.5 8.09V15.18Z"/>
    </svg>
    <span className="text-2xl font-bold text-primary transition-colors duration-300">UKM Kits</span>
  </div>
);


const NavLinks: React.FC<{ mobile?: boolean; onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }> = ({ mobile, onLinkClick }) => {
    const links = [
        { name: 'Fitur', href: '#features' },
        { name: 'Testimoni', href: '#testimonials' },
        { name: 'Harga', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
    ];

    const navClasses = mobile 
        ? "flex flex-col space-y-1"
        : "flex items-center space-x-8";

    const linkClasses = mobile
        ? "block py-3 px-3 rounded-md text-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-primary transition-colors duration-200"
        : "text-gray-600 hover:text-primary font-medium transition-colors duration-300";

    return (
        <nav className={navClasses}>
            {links.map(link => (
                <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={onLinkClick}
                    className={linkClasses}
                >
                    {link.name}
                </a>
            ))}
        </nav>
    );
}

const HeadNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute('href');

      if (href === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
      }

      if (href && href.startsWith('#')) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
          }
      }
  };
  
  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      handleSmoothScroll(e);
      setIsOpen(false);
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleSmoothScroll}><Logo /></a>
          <div className="hidden lg:flex items-center space-x-8">
            <NavLinks onLinkClick={handleSmoothScroll} />
            <div className="flex items-center space-x-4">
                <Link href="/sign-in" className="text-gray-600 hover:text-primary font-medium transition-colors duration-300">
                    Masuk
                </Link>
                <Link href="/sign-up" className="bg-accent text-primary font-bold py-2 px-6 rounded-full hover:bg-yellow-500 transition duration-300 shadow-sm">
                  Daftar Gratis
                </Link>
            </div>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary focus:outline-none transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
              </svg>
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-lg shadow-xl p-4">
            <NavLinks mobile={true} onLinkClick={handleMobileLinkClick} />
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-primary font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition duration-300 block border border-gray-300"
                >
                    Masuk
                </Link>
                <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-accent text-primary font-bold py-3 px-6 rounded-full hover:bg-yellow-500 transition duration-300 block"
                >
                  Daftar Gratis
                </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeadNav;
