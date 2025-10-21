import React from 'react';

const CTASection: React.FC = () => {
  return (
    <section className="bg-secondary">
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Siap Mengubah Bisnis Anda?
        </h2>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
          Bergabunglah dengan ribuan UMKM lain yang telah berhasil go-digital bersama kami. Mulai perjalanan sukses Anda hari ini.
        </p>
        <a 
          href="#pricing" 
          className="mt-8 inline-block bg-accent text-primary font-bold py-4 px-10 rounded-full hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-xl"
        >
          Daftar Sekarang Juga
        </a>
      </div>
    </section>
  );
};

export default CTASection;
