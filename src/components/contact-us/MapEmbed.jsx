import React, { useState } from 'react';

const MapEmbed = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  // Replace with your actual Google Maps embed URL or coordinates
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095919355!2d-74.00425878459418!3d40.74844097932764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259af15f27685%3A0x36746c228b7e8b7e!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus";
  
  const address = "123 Business Street, Suite 456, New York, NY 10001";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Find Us Here
        </h2>
        <p className="text-gray-600 text-sm">
          Click on the map to open directions in Google Maps
        </p>
      </div>
      
      <div className="relative">
        {/* Map Container */}
        <div className="w-full h-64 md:h-80 relative overflow-hidden">
          {!isMapLoaded && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-300 rounded-lg mb-4">
                  <span className="text-3xl text-gray-600">🗺️</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">Loading Map...</p>
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          )}
          
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Store Location Map"
            onLoad={() => setIsMapLoaded(true)}
            className={`transition-opacity duration-500 ${isMapLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Overlay for interactivity */}
          <div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-10 transition-all duration-200 cursor-pointer flex items-center justify-center group"
               onClick={() => window.open(googleMapsUrl, '_blank')}>
            <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:scale-105">
              <span className="text-sm font-medium text-gray-800 flex items-center">
                <span className="mr-2">🧭</span>
                Open in Google Maps
              </span>
            </div>
          </div>
        </div>
        
        {/* Map Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🧭</span>
              Get Directions
            </a>
            
            <button
              onClick={() => setShowFullMap(!showFullMap)}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              <span className="mr-2">{showFullMap ? '📍' : '🔍'}</span>
              {showFullMap ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
        
        {/* Additional Location Details */}
        {showFullMap && (
          <div className="p-4 bg-blue-50 border-t border-blue-200 animate-fadeIn">
            <h3 className="font-semibold text-gray-900 mb-3">Location Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Parking:</span>
                <p className="text-gray-600">Street parking available, nearby parking garage</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Public Transit:</span>
                <p className="text-gray-600">Subway: 6 train to 33rd St station (2 min walk)</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Accessibility:</span>
                <p className="text-gray-600">Wheelchair accessible entrance and elevators</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nearby:</span>
                <p className="text-gray-600">Empire State Building, Macy's Herald Square</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapEmbed;