export default function ProductGallery({ images }) {
  const [mainImage, setMainImage] = useState(images[0]);
  return (
    <div className="grid grid-cols-4 gap-2">
      <img src={mainImage} className="col-span-4 rounded-lg" />
      <div className="flex gap-2">
        {images.map(img => (
          <img 
            src={img} 
            onClick={() => setMainImage(img)}
            className="cursor-pointer rounded-lg hover:opacity-75" 
          />
        ))}
      </div>
    </div>
  );
}