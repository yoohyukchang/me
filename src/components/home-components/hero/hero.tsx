import Image from "next/image";

export default function Hero() {
  return (
    <section className="py-16 md:py-32 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
      <div className="flex-1 space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
          Hello!
          <br />
          I'm Yoohyuk
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
            Let's connect
          </a>
        </div>
      </div>
      <div className="relative w-full md:w-1/2 aspect-square">
        <div className="absolute inset-0 bg-gray-100 rounded-2xl overflow-hidden">
          <Image
            src="/profile-photo.jpg"
            alt="Yoohyuk Chang"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}