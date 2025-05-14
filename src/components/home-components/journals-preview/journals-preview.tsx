export default function JournalPreview() {
  return (
    <section id="journal" className="py-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Life Journal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">May 5, 2025</p>
          <h3 className="text-xl font-medium mb-3">Summer Internship Reflections</h3>
          <p className="text-gray-600 mb-4">Thoughts on my first week at Samsung and the exciting projects ahead...</p>
          <a href="#" className="text-black font-medium text-sm inline-flex items-center">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">April 12, 2025</p>
          <h3 className="text-xl font-medium mb-3">Baltimore's Hidden Gems</h3>
          <p className="text-gray-600 mb-4">Exploring some of my favorite local spots in the city during spring break...</p>
          <a href="#" className="text-black font-medium text-sm inline-flex items-center">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">March 20, 2025</p>
          <h3 className="text-xl font-medium mb-3">Learning to Build with Next.js</h3>
          <p className="text-gray-600 mb-4">My journey creating this personal website and what I've learned along the way...</p>
          <a href="#" className="text-black font-medium text-sm inline-flex items-center">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </div>
      <div className="mt-8 text-center">
        <a href="#" className="inline-block border border-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-colors">
          View all journal entries
        </a>
      </div>
    </section>
  );
}