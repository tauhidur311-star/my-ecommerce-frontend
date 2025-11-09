import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ZoomableImage({ src, alt }) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={3}
      wheel={{ step: 0.1 }}
    >
      <TransformComponent>
        <img
          src={src}
          alt={alt}
          className="w-full h-64 object-cover cursor-zoom-in"
        />
      </TransformComponent>
    </TransformWrapper>
  );
}