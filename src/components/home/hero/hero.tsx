'use client';
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "/profile/profile-photo-1.jpg",
    "/profile/profile-photo-2.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="py-16 md:py-32 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
      <div className="flex-1 space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
          Hello!
          <br />
          I&apos;m Yoohyuk
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          CS student at Johns Hopkins, tech enthusiast, and occasional adventurer. 
          This is my digital space where I share my journey, projects, and thoughts.
        </p>
        <div className="pt-4">
          <a 
            href="#contact" 
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Let&apos;s connect
          </a>
        </div>
      </div>
      <div className="relative w-full md:w-1/2 aspect-square">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gray-100 rounded-2xl overflow-hidden">
            {images.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentImage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={src}
                  alt={`Yoohyuk Chang ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          
          {/* Dot indicators */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentImage 
                    ? 'bg-black' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}