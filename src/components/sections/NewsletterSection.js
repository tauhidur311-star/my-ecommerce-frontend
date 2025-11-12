import React from 'react';

const NewsletterSection = ({ section, settings, isEditing }) => {
  return (
    <section className="py-16 bg-blue-50 relative">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Signup</h2>
        <p className="text-gray-600 mb-8">Stay updated with our latest news</p>
        <div className="max-w-md mx-auto flex">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-r-lg">
            Subscribe
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="absolute top-4 left-4 bg-indigo-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Newsletter Section
        </div>
      )}
    </section>
  );
};

export default NewsletterSection;