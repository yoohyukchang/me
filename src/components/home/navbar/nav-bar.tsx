'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#e5e7eb]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tighter hover:text-[#6b7280] transition-colors">Yoohyuk Chang</Link>
        <ul className="hidden md:flex space-x-8">
          <li><Link href="/#about" className="text-[#6b7280] hover:text-black transition-colors">About</Link></li>
          <li><Link href="/#projects" className="text-[#6b7280] hover:text-black transition-colors">Projects</Link></li>
          <li><Link href="/#blog" className="text-[#6b7280] hover:text-black transition-colors">Blog</Link></li>
          {/* <li><Link href="/#skills" className="text-[#6b7280] hover:text-black transition-colors">Skills</Link></li> */}
          <li><Link href="/#contact" className="text-[#6b7280] hover:text-black transition-colors">Contact</Link></li>
        </ul>
        <button 
          className="md:hidden p-2 text-[#6b7280] hover:text-black transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-6 py-4 md:hidden">
          <div className="space-y-4">
            <div>
              <Link 
                href="/#about" 
                className="block text-[#6b7280] hover:text-black transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </div>
            <div>
              <Link 
                href="/#projects" 
                className="block text-[#6b7280] hover:text-black transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
            </div>
            <div>
              <Link 
                href="/#blog" 
                className="block text-[#6b7280] hover:text-black transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
            </div>
            <div>
              <Link 
                href="/#contact" 
                className="block text-[#6b7280] hover:text-black transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}