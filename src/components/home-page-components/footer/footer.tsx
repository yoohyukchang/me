export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Yoohyuk. All rights reserved.</p>
        <p className="text-sm mt-2">Designed and built with Next.js and Tailwind CSS</p>
      </div>
    </footer>
  );
}