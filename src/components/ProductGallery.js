import React, { useState } from 'react';

export default function ProductGallery({ images }) {
  const [mainImage, setMainImage] = useState(images[0]);
  return (
    <div className="grid grid-cols-4 gap-2">
      <img src={mainImage} alt="Product main view" className="col-span-4 rounded-lg" />
      <div className="flex gap-2">
        {images.map((img, index) => (
          <img 
            key={index}
            src={img} 
            alt={`Product view ${index + 1}`}
            onClick={() => setMainImage(img)}
            className="cursor-pointer rounded-lg hover:opacity-75" 
          />
        ))}
      </div>
    </div>
  );
}