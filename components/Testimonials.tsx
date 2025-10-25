'use client';

import React from 'react';
import { useInView } from '@/lib/hooks/useInView';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex text-accent">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-accent' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        ))}
    </div>
);

const testimonialData: { quote: string; name: string; company: string; avatarUrl: string; rating: number; }[] = [];


const Testimonials: React.FC = () => {
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="testimonials" className="py-20 bg-light">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Dipercaya oleh Ratusan UMKM</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Lihat apa kata mereka yang telah merasakan dampak positif dari platform kami.
          </p>
        </div>
        <div ref={ref}>
            {testimonialData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonialData.map((testimonial, index) => (
                        <div 
                            key={index} 
                            className={`bg-white p-8 rounded-lg shadow-lg flex flex-col transition-all duration-300 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}
                            style={{ animationDelay: `${index * 150}ms`}}
                        >
                        <StarRating rating={testimonial.rating} />
                        <p className="text-gray-600 mt-4 flex-grow">&ldquo;{testimonial.quote}&rdquo;</p>
                        <div className="mt-6 flex items-center">
                            <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-14 h-14 rounded-full mr-4" />
                            <div>
                            <p className="font-bold text-primary">{testimonial.name}</p>
                            <p className="text-sm text-gray-500">{testimonial.company}</p>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`text-center text-gray-500 bg-white p-12 rounded-lg shadow-lg transition-all duration-500 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
                    <p className="text-lg">Kisah sukses dari para pengguna kami akan segera hadir di sini!</p>
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
