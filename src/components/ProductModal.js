import React, { useRef, useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ProductModal({
  product,
  setSelectedProduct,
  selectedSize,
  setSelectedSize,
  addToCart,
  isAddingToCart
}) {
  const [mainImage, setMainImage] = useState((product.images && product.images[0]) || 'https://via.placeholder.com/400');
  const modalRef = useRef(null);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !event.target.closest('.modal-content')) {
        setSelectedProduct(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectedProduct]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="modal-content bg-white rounded-lg w-full max-w-4xl mx-auto my-4 overflow-y-auto max-h-[90vh]"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <button 
            onClick={() => setSelectedProduct(null)}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-2xl aspect-square relative">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={3}
                centerOnInit={true}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full"
                    >
                      <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                    </TransformComponent>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => zoomIn()}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-lg"
                      >
                        Zoom In
                      </button>
                      <button
                        onClick={() => zoomOut()}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-lg"
                      >
                        Zoom Out
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-lg"
                      >
                        Reset
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setMainImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Select Size:</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">৳{product.price}</span>
              <button
                onClick={() => addToCart(product, selectedSize)}
                disabled={isAddingToCart || !selectedSize}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAddingToCart && <Loader2 className="animate-spin" size={20} />}
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}