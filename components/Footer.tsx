import React from 'react';

const SocialIcon: React.FC<{ href: string, path: string }> = ({ href, path }) => (
    <a href={href} className="text-gray-400 hover:text-white transition duration-300">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d={path}></path>
        </svg>
    </a>
);


const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">UMKM KitStudio</h3>
            <p className="text-gray-400">Memberdayakan UMKM Indonesia melalui teknologi digital yang mudah diakses dan terjangkau.</p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition">Fitur</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Harga</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white transition">Testimoni</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
                <SocialIcon href="#" path="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.55v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.5 20.33 8.79c0-.21 0-.42-.01-.62.84-.6 1.56-1.36 2.14-2.23z" />
                <SocialIcon href="#" path="M16.3 5.8s-1.2-.4-3.3-.4c-2.1 0-2.8.4-2.8.4s-1 .4-1.7.9c-.7.5-1.1 1.3-1.1 1.3s-.4 1.2-.4 3.3c0 2.1.4 3.3.4 3.3s.4 1.2 1.1 1.7c.7.5 1.7.9 1.7.9s1.2.4 3.3.4c2.1 0 3.3-.4 3.3-.4s1-.4 1.7-.9c.7-.5 1.1-1.3 1.1-1.3s.4-1.2.4-3.3c0-2.1-.4-3.3-.4-3.3s-.4-1.2-1.1-1.7c-.7-.5-1.7-.9-1.7-.9zM12 15.3c-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3 3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3z" />
                <SocialIcon href="#" path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 13.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5v-4c0-.28-.22-.5-.5-.5h-1c-.28 0-.5.22-.5.5v4c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5h2c.28 0 .5.22.5.5v1.5h1V9.5c0-.28.22-.5.5-.5h2c.28 0 .5.22.5.5v6z" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} UMKM KitStudio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
