import React, { useMemo } from 'react';
import { formatCurrency, getProductPriceRange, convertNewlinesToParagraphs } from '../../utils';
import { Product, VariantCombination, StockStatus, PriceType, ProductImage } from '../../types';
import Accordion from '../../components/Accordion';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';

interface PreviewViewProps {
  product: Product | Omit<Product, 'id' | 'slug' | 'updatedAt'>;
  onBackToEdit: () => void;
}

const PreviewView: React.FC<PreviewViewProps> = ({ product, onBackToEdit }) => {
  const selectedImage: ProductImage | undefined = useMemo(() => 
    product.images.find(img => img.id === product.coverImageId) || product.images[0],
    [product.images, product.coverImageId]
  );
  
  const priceInfo = useMemo(() => {
    if (product.priceType === PriceType.SINGLE) {
      return {
        displayPrice: (product.price ?? 0) > 0 ? formatCurrency(product.price!) : 'Tanya harga',
        strikethrough: product.strikethroughPrice ? formatCurrency(product.strikethroughPrice) : undefined
      };
    }
    // For variable products, we just show the range in preview
    return {
        displayPrice: getProductPriceRange(product as Product).displayPrice,
        strikethrough: undefined
    };
  }, [product]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Pratinjau Halaman Produk</h2>
            <button 
                onClick={onBackToEdit} 
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
                <ArrowLeftIcon />
                <span>Kembali ke Editor</span>
            </button>
        </div>

        {/* Mimicking the public view structure */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Image Gallery */}
                <div>
                    <div className="aspect-square w-full overflow-hidden rounded-lg shadow-lg">
                        {selectedImage ? <img src={selectedImage.url} alt={selectedImage.altText || product.name} className="w-full h-full object-center object-cover" /> : <div className="w-full h-full bg-gray-200"></div>}
                    </div>
                    {product.images.length > 1 && (
                        <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4">
                        {product.images.map(image => (
                            <div
                                key={image.id}
                                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage?.id === image.id ? 'border-secondary ring-2 ring-secondary' : 'border-transparent'}`}
                            >
                                <img src={image.url} alt={image.altText || `Thumbnail ${product.name}`} className="w-full h-full object-cover"/>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                    {product.badges.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            {product.badges.map(badge => (
                                <span key={badge} className="px-2.5 py-1 text-xs font-bold text-primary bg-accent/80 rounded-full">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="mt-3 flex items-baseline">
                        <p className="text-2xl sm:text-3xl text-gray-900 font-bold">{priceInfo.displayPrice}</p>
                        {priceInfo.strikethrough && <p className="text-xl text-gray-500 line-through ml-3">{priceInfo.strikethrough}</p>}
                    </div>
                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: convertNewlinesToParagraphs(product.longDescription || product.shortDescription) }} />
                    </div>

                    {product.priceType === PriceType.VARIANT && product.variants.groups.length > 0 && (
                        <div className="mt-8">
                        {product.variants.groups.map(group => (
                            <div key={group.id} className="mb-4">
                            <h4 className="text-sm text-gray-900 font-medium mb-2">{group.name}</h4>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map(option => (
                                    <div 
                                        key={option}
                                        className="border rounded-md py-2 px-4 text-sm font-medium bg-gray-100 border-gray-300 text-gray-600"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            </div>
                        ))}
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">Tombol aksi (Tambah ke Keranjang, Beli Cepat) akan muncul di sini.</p>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            {product.faq.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tanya Jawab</h2>
                    <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {product.faq.map(item => (
                        <Accordion key={item.id} title={item.question}>
                            <p className="text-gray-700">{item.answer}</p>
                        </Accordion>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PreviewView;
