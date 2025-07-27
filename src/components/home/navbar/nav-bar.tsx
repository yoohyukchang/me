import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#e5e7eb]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tighter">Yoohyuk Chang</h2>
        <ul className="hidden md:flex space-x-8">
          <li><Link href="/#about" className="text-[#6b7280] hover:text-black transition-colors">About</Link></li>
          <li><Link href="/#projects" className="text-[#6b7280] hover:text-black transition-colors">Projects</Link></li>
          <li><Link href="/#blog" className="text-[#6b7280] hover:text-black transition-colors">Blog</Link></li>
          {/* <li><Link href="/#skills" className="text-[#6b7280] hover:text-black transition-colors">Skills</Link></li> */}
          <li><Link href="/#contact" className="text-[#6b7280] hover:text-black transition-colors">Contact</Link></li>
        </ul>
        <button className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </nav>
  );
}