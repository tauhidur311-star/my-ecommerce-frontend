import { useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ImageCropper({ image, onCropComplete }) {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    aspect: 1,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
        <h3 className="text-lg font-bold mb-4">Adjust Image</h3>
        <ReactCrop
          src={image}
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={(crop) => onCropComplete(crop)}
        />
      </div>
    </div>
  );
}