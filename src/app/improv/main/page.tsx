import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "From the Back Row to Center Stage | Improv Blog",
  description:
    "An improv journey blog by Yoohyuk Chang — documenting lessons, reflections, and growth from Improvisational Techniques for Communication.",
};

const upcomingPosts = [
  {
    id: 1,
    title: "First Impressions & Integration",
    description: "What surprised me, what excites me, and two improv rules I want to carry into everyday life.",
    href: "/improv/blog1",
  },
  {
    id: 2,
    title: "Blog Post 2",
    description: "Coming soon — more improv stories on the way.",
    href: "/improv/blog2",
  },
];

export default function ImprovHome() {
  return (
    <main className="container mx-auto px-6 pb-16">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-20 max-w-3xl">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">
          Paul&apos;s Improv Blog Journey
        </p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
          From the Back Row to Center Stage
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          A semester-long blog documenting my journey through improvisation.
          Written by someone who&apos;s more comfortable behind a camera
          than in front of an audience.
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <span>By Yoohyuk (Paul) Chang</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Improvisational Techniques for Communication</span>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* About Me */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">About Me</h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Hi, my name is Yoohyuk (Paul), and welcome to my improv blog! I
            currently live in Baltimore, Maryland, and I&apos;m studying
            Computer Science at Johns Hopkins University, pursuing both a
            B.S. and an M.S. I plan to graduate this May.
          </p>
          <p>
            I am generally not a very outgoing person. I don&apos;t think I usually
            start conversations first and tend to observe rather than speak up.
            But I do sometimes push myself to take the initiative and start a conversation
            when everyone in the group is also very introverted. Doing that
            takes a lot of courage and energy for me, and it&apos;s something I
            still find challenging.
          </p>
          <p>
            Because of this, I want to learn how to reach out to people more
            confidently and have conversations that feel more engaging and
            natural. I&apos;m especially interested in improving how I
            communicate with others without overthinking every response.
          </p>
          <p>
            Outside of class, I enjoy photography. I use a Fujifilm X-T50
            camera during trips to other countries and occasionally around
            campus when I feel like capturing a moment. Photography gives me
            space to slow down and think about how to express the emotions
            I&apos;m feeling at that moment, without needing to say anything out
            loud.
          </p>
        </div>

        {/* Photography Examples */}
        <div className="mt-10 flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden group">
            <Image
              src="/improv/improv_home_1.jpg"
              alt="Photography example 1"
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden group">
              <Image
                src="/improv/improv_home_2.jpg"
                alt="Photography example 2"
                width={800}
                height={600}
                sizes="(max-width: 768px) 50vw, 384px"
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="rounded-xl overflow-hidden group">
              <Image
                src="/improv/improv_home_3.jpg"
                alt="Photography example 3"
                width={800}
                height={600}
                sizes="(max-width: 768px) 50vw, 384px"
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400 text-center">
          A few shots from my Fujifilm X-T50
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Blog Purpose */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          What This Blog Is About
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            This blog documents my improv journey from the perspective of
            someone who is naturally quiet and more comfortable observing than
            performing. Rather than treating improv as something only outgoing
            people are good at, I want to explore it as a skill that can be
            learned and practiced.
          </p>
          <p>
            Throughout the semester, I&apos;ll reflect on class activities,
            challenges, and takeaways, while explaining improv concepts in an
            approachable way for readers who may have never taken an improv
            class. My goal is to connect improv to everyday communication and
            show how it can help people become more confident and present in
            conversations.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Why Improv */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Why I Chose This Class
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            I chose this improv class because I want to improve my
            communication skills and learn how to make conversations more
            engaging and less awkward. I believe improvisational skills are
            important for keeping conversations interesting, especially when
            there isn&apos;t a clear script to follow.
          </p>
          <p>
            After participating in class activities, I realized that improv
            offers practical techniques I can actually learn from, such as
            listening better, responding more naturally, and staying present. I
            didn&apos;t have many chances before this course to practice
            speaking confidently in front of others or leading conversations,
            and I hope this class helps me build those skills moving forward.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Blog Posts */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Blog Posts</h2>

        <div className="space-y-4">
          {upcomingPosts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                  <span className="text-lg font-bold text-gray-600 group-hover:text-white transition-colors">
                    {post.id}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black group-hover:text-gray-900 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {post.description}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
