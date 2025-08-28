import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-20 flex flex-col md:flex-row gap-16">
      <div className="flex-1">
        <h2 className="text-3xl font-bold tracking-tight mb-8">About Me</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Hi there! I&apos;m Yoohyuk, a Computer Science student at Johns Hopkins University with a passion for 
            technology, learning, and exploring new experiences.
          </p>
          <p>
            When I&apos;m not coding or studying, you might find me traveling to different countries, 
            capturing street photography with my Fujifilm X-T50, watching penguin documentaries, or 
            playing chess (although I&apos;m not very good at it yet). I believe in balancing 
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
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:border-gray-400 group-hover:scale-105 overflow-hidden">
              <Image 
                src="/logos/johns_hopkins.png" 
                alt="Johns Hopkins University logo" 
                width={80}
                height={80}
                className="object-cover rounded-xl scale-125"
              />
            </div>
            <div className="transition-all duration-200 group-hover:translate-x-1">
              <p className="font-medium text-black group-hover:text-gray-900">B.S. Computer Science</p>
              <p className="text-gray-600 group-hover:text-gray-700">Johns Hopkins University</p>
              <p className="text-gray-500 text-sm mt-1">2022 - 2026</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Experience</h3>
          
          {/* Timeline Container */}
          <div className="relative">
            {/* Main Timeline Line */}
            <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-gray-300"></div>
            
            <div className="space-y-8">
              {/* Amazon Experience */}
              <div className="relative flex items-center gap-5 group cursor-pointer">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:border-gray-400 group-hover:scale-105 overflow-hidden">
                  <Image 
                    src="/logos/amazon.png" 
                    alt="Amazon logo" 
                    width={60}
                    height={60}
                    className="object-cover rounded-xl"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 transition-all duration-200 group-hover:translate-x-1">
                  <p className="font-medium text-black group-hover:text-gray-900">Software Development Engineer Intern</p>
                  <p className="text-gray-600 group-hover:text-gray-700">Amazon</p>
                  <p className="text-gray-500 text-sm mt-1">June 2025 - August 2025</p>
                </div>
              </div>
              
              {/* Samsung Experience */}
              <div className="relative flex items-center gap-5 group cursor-pointer">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:border-gray-400 group-hover:scale-105">
                  <Image 
                    src="/logos/samsung.png" 
                    alt="Samsung logo" 
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 transition-all duration-200 group-hover:translate-x-1">
                  <p className="font-medium text-black group-hover:text-gray-900">Machine Learning Engineer Intern</p>
                  <p className="text-gray-600 group-hover:text-gray-700">Samsung Electronics</p>
                  <p className="text-gray-500 text-sm mt-1">June 2024 - August 2024</p>
                </div>
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