import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog 1: First Impressions & Integration | From the Back Row to Center Stage",
  description:
    "First impressions of improv class, what excites and challenges me, and two rules I want to carry into everyday life.",
};

export default function Blog1() {
  return (
    <main className="container mx-auto px-6 pb-16">
      {/* Header */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 max-w-3xl">
        <Link
          href="/improv/main"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Home
        </Link>
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">
          Blog Post 1
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
          First Impressions &amp; Integration
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Reflections after my first few weeks of improv class: what surprised
          me, what excites me, what still makes me nervous, and two rules I want
          to carry into my everyday life.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <span>By Yoohyuk (Paul) Chang</span>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 1: Initial Impressions */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          What I Didn&apos;t Expect About Improv
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Before taking this class, I thought improvisation was a skill you
            were either born with or one that was extremely difficult to learn
            through practice. I also didn&apos;t think of it as something
            particularly important for communication. In my mind, good
            communication was mostly about preparation: knowing what to say
            before a conversation even started.
          </p>
          <p>
            After a few weeks in this class, I have started to change my mind. I
            now think improvisation might be one of the most important factors in
            making communication feel smooth and in building genuine connections
            between people. It is not just about thinking of the next clever
            thing to say on the spot. It requires sincere listening and paying
            close attention to details like the speaker&apos;s hand gestures,
            tone, and emotions. That is what makes improvisation during a real
            conversation actually work.
          </p>
          <p>
            One activity that stood out to me was a game where we gathered in a
            circle and took turns continuing a story based on the alphabet. If
            one person started a sentence with the letter A, they would point to
            someone else, and that person had to continue with a sentence
            starting with B, and so on. I did not think I had the
            improvisational skills to do well in this activity. But I noticed
            that when I focused more and really paid attention to the speakers
            before me, I actually performed better. That surprised me.
          </p>
          <p>
            A{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8056562/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              study published in the Journal of the Medical Humanities
            </a>{" "}
            found that improv exercises designed around active listening helped
            students improve their real-time communication and empathy. That
            matches what I experienced in class: once I stopped worrying about
            what I was going to say next and just listened, my responses became
            much more natural.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 2: Excitement Factor */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          What Keeps Me Coming Back
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            I still feel a bit nervous before activities sometimes, partly
            because English is not my first language and I occasionally worry
            about my fluency. But the activities we do in class push me to focus
            on the speakers and think carefully about how to convey my thoughts
            clearly to the listener. That process is what excites me, because I
            know it will eventually improve the way I communicate outside of
            class as well.
          </p>
          <p>
            Because I sometimes doubt my English fluency, I can get worried
            before even starting a conversation. But what energizes me about
            this course is the fact that my communication skills can genuinely
            improve through practice, so that I can have smoother, more
            meaningful interactions with others.
          </p>
          <p>
            One activity I remember well involved pairs. One person would look
            at a complex drawing on the board and describe it to their partner,
            who could not see it. The partner had to recreate the drawing based
            only on the verbal description, and the describer was not allowed to
            look at the partner&apos;s progress. This exercise was focused on
            practicing &quot;Active Listening,&quot; which is a key skill in
            improv. I realized during this activity
            that I had to think from my partner&apos;s perspective in order to
            describe the drawing effectively. It was not just about what I saw;
            it was about what my partner needed to hear.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 3: Honest Nervousness */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          The Part That Still Makes Me Nervous
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            As I mentioned earlier, the thing that makes me most nervous in this
            class is my uncertainty about my language fluency. Because English is
            not my first language, I sometimes worry about choosing the wrong
            word or not understanding slang or jargon that a partner might use. I
            feel like that could interrupt the flow of a conversation, and that
            thought is what sometimes makes me anxious before activities.
          </p>
          <p>
            That said, I have been feeling more confident with each class I
            attend. Learning concepts like &quot;Yes, And&quot; has given me a
            clearer sense of what to do during an interaction, even when I am
            unsure of the exact right words. The principle encourages me to
            accept what my partner offers and build on it, which takes the
            pressure off of finding the &quot;perfect&quot; response. It has
            helped me realize that communication is less about perfection and
            more about being present and willing to engage.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 4: Rules Integration */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Two Rules I&apos;m Taking With Me
        </h2>

        {/* Rule 1: Top of Your Intelligence */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold tracking-tight mb-4">
            Top of Your Intelligence
          </h3>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              One rule that deeply resonates with me is &quot;Top of Your
              Intelligence.&quot; This refers to responding truthfully to any
              stimulus within a scene. The idea is to allow yourself to have an
              honest emotional response rather than forcing something clever or
              performative.
            </p>
            <p>
              I initially thought this rule was about being smart or witty. But
              it is actually about using all of your emotional and social
              intelligence to react truthfully to others. I value this principle
              because I feel most respected when someone responds to what I say
              with genuine honesty. I believe that, at its core, all good
              communication comes from being truthful.
            </p>
            <div className="my-8 rounded-xl overflow-hidden">
              <video
                className="w-full"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/improv/making-eye-contact.webm" type="video/webm" />
              </video>
            </div>

            <p>
              Recently, I noticed that I do not make much eye contact when
              speaking one-on-one with someone. When someone else did the same to
              me, I realized it can make a person seem less genuine about what
              they are saying. A{" "}
              <a
                href="https://www.pnas.org/doi/10.1073/pnas.2106645118"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 transition-colors"
              >
                study published in PNAS
              </a>{" "}
              found that eye contact signals the rise and fall of shared
              attention in conversation, meaning it plays a direct role in how
              connected and engaged two people feel during an interaction. This
              aligns with what I experienced: when someone avoids eye contact, it
              becomes harder to feel that the conversation is genuine.
            </p>
            <p>
              So I think the first step toward practicing this rule in everyday
              life is to maintain eye contact and really pay attention to every
              detail and emotion of the speaker, not just their words. I believe
              that over time, this habit will help me build stronger and more
              honest connections with the people around me.
            </p>
          </div>
        </div>

        {/* Rule 2: Give and Take */}
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-4">
            Give and Take
          </h3>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Another rule that resonates with me is &quot;Give and
              Take.&quot; This rule is about the balance of sharing and
              receiving focus in a conversation
              or scene. It means knowing when to step forward and contribute, and
              when to step back and let someone else lead.
            </p>
            <p>
              I think this connects naturally to &quot;Top of Your
              Intelligence,&quot; because just listening on its own does not make
              you a truly engaged participant. Communication is a two-way
              exchange. Being a good communicator means knowing when it is your
              turn to contribute and when it is your turn to listen. If one
              person does all the talking, the other person is not really part of
              the conversation. And if one person stays silent the entire time,
              the speaker has no way of knowing whether they are being understood.
            </p>
            <p>
              In everyday life, I want to practice this by being more aware of
              conversation dynamics. In group settings, I tend to stay quiet and
              let others take the lead. But &quot;Give and Take&quot; reminds me
              that stepping in to share my thoughts is just as important as
              stepping back to listen. For example, in study groups or team
              meetings, I often have ideas but hesitate to share them because I
              do not want to interrupt. Moving forward, I want to recognize those
              moments as opportunities to &quot;give&quot; rather than always
              defaulting to &quot;take.&quot;
            </p>
            <p>
              I think applying this rule will help me become a more active
              participant in conversations, both in and outside of class. It is
              not about talking more for the sake of it, but about contributing
              meaningfully when the moment calls for it.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* References */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">References</h2>

        <ol className="list-decimal list-inside space-y-4 text-gray-600 leading-relaxed">
          <li>
            Gao, J., et al. (2021). &quot;Improvisation as a Teaching Tool for
            Improving Oral Communication Skills in Premedical and Pre-Biomedical
            Graduate Students.&quot;{" "}
            <span className="italic">Journal of Medical Humanities.</span>{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8056562/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              https://pmc.ncbi.nlm.nih.gov/articles/PMC8056562/
            </a>
          </li>
          <li>
            Wohltjen, S., &amp; Wheatley, T. (2021). &quot;Eye contact marks
            the rise and fall of shared attention in conversation.&quot;{" "}
            <span className="italic">
              Proceedings of the National Academy of Sciences (PNAS).
            </span>{" "}
            <a
              href="https://www.pnas.org/doi/10.1073/pnas.2106645118"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              https://www.pnas.org/doi/10.1073/pnas.2106645118
            </a>
          </li>
        </ol>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Navigation */}
      <section className="py-16 max-w-3xl">
        <div className="flex justify-between items-center">
          <Link
            href="/improv/main"
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
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
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Home
          </Link>
          <Link
            href="/improv/blog2"
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            Blog 2
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
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
