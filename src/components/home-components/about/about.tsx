import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-20 flex flex-col md:flex-row gap-16">
      <div className="flex-1">
        <h2 className="text-3xl font-bold tracking-tight mb-8">About Me</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Hi there! I'm Yoohyuk, a Computer Science student at Johns Hopkins University with a passion for 
            technology, learning, and exploring new experiences.
          </p>
          <p>
            When I'm not coding or studying, you might find me exploring Baltimore's food scene, 
            reading science fiction, or attempting to perfect my latte art. I believe in balancing 
            technical pursuits with creative outlets and personal growth.
          </p>
          <p>
            This website serves as both my professional portfolio and a personal space to document my 
            journey through college, career milestones, and life adventures.
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Education</h3>
          
          {/* University */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              <Image 
                src="/logos/johns_hopkins.png" 
                alt="Johns Hopkins University logo" 
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-medium text-black">B.S. Computer Science</p>
              <p className="text-gray-600">Johns Hopkins University</p>
              <p className="text-gray-500 text-sm mt-1">2022 - 2026</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Experience</h3>
          
          {/* Experience Cards */}
          <div className="space-y-5">
            {/* Amazon Experience */}
            <div className="flex items-center gap-4 p-2 group">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/logos/amazon.png" 
                  alt="Amazon logo" 
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-black">Software Development Engineer Intern</p>
                <p className="text-gray-600">Amazon</p>
                <p className="text-gray-500 text-sm mt-1">June 2025 - August 2025</p>
              </div>
            </div>
            
            {/* Samsung Experience */}
            <div className="flex items-center gap-4 p-2 group">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/logos/samsung.png" 
                  alt="Samsung logo" 
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-black">Machine Learning Engineer Intern</p>
                <p className="text-gray-600">Samsung Electronics</p>
                <p className="text-gray-500 text-sm mt-1">June 2024 - August 2024</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Interests</h3>
          <p className="text-gray-600">Software Development, Machine Learning, Photography, Running</p>
        </div>
      </div>
    </section>
  );
}