import React from 'react';

const GallerySection = ({ section, settings, isEditing }) => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Gallery Section</h2>
          <p className="text-gray-500">Gallery component coming soon...</p>
        </div>
      </div>
      {isEditing && (
        <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Gallery Section
        </div>
      )}
    </section>
  );
};

export default GallerySection;