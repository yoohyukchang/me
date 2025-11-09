import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="py-20 flex flex-col md:flex-row gap-16">
      <div className="flex-1">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Explore</h2>
        <p className="text-gray-600 mb-8">
          Discover my work, thoughts, and journey through these sections.
        </p>

        <div className="space-y-4">
          {/* Projects Link */}
          <Link
            href="/projects"
            className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-white transition-colors">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-black group-hover:text-gray-900 transition-colors">Projects</h3>
                <p className="text-gray-600 text-sm mt-1">Explore my technical work and creations</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </Link>

          {/* Blog Link */}
          <Link
            href="/blogs"
            className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-white transition-colors">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-black group-hover:text-gray-900 transition-colors">Blog</h3>
                <p className="text-gray-600 text-sm mt-1">Read my experiences and reflections</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </Link>

          {/* Photos Link (Coming Soon) */}
          <div className="group block p-6 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-500">Photos</h3>
                <p className="text-gray-500 text-sm mt-1">Coming soon</p>
              </div>
            </div>
          </div>
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