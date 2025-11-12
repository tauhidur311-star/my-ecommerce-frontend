import React from 'react';

const ContactFormSection = ({ section, settings, isEditing }) => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Contact Us</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <input 
              type="text" 
              placeholder="Subject" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <textarea 
              placeholder="Your Message" 
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      {isEditing && (
        <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Contact Form Section
        </div>
      )}
    </section>
  );
};

export default ContactFormSection;