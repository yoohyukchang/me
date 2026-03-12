import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog 2: Risk and Flexibility | From the Back Row to Center Stage",
  description:
    "Reflections on adaptability and risk-taking through improv, from an antique shop scene to Amazon and beyond.",
};

export default function Blog2() {
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
          Blog Post 2
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
          Risk and Flexibility
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Welcome to the next part of my improv portfolio. We&apos;ve covered a
          good amount of ground since the last time we were here, and I&apos;m
          excited to share what I&apos;ve discovered about risk-taking and
          flexibility, both inside class and well outside of it.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <span>By Yoohyuk (Paul) Chang</span>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Welcome Back */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Picking Up Where We Left Off
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            In my first blog, I talked about how improv surprised me. I thought
            it was going to be mostly about cleverness or quick thinking, but it
            turned out to be a lot more about genuine listening. I wrote about
            &quot;Top of Your Intelligence&quot; and &quot;Give and Take,&quot;
            two principles that actually changed how I think about communication.
            At the time, they still felt a bit abstract, like things I
            understood intellectually but hadn&apos;t really tested.
          </p>
          <p>
            Since then, things have gotten more concrete. The concepts keep
            coming up, not just in class but in situations I wouldn&apos;t have
            connected to improv before. This post is about two of those themes:
            flexibility and risk. I&apos;ll be honest, they sounded a bit like
            buzzwords to me at first. But the more class time I&apos;ve had, the
            more specific and personal they&apos;ve become.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 1 */}
      <section className="py-16 max-w-3xl">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-3">
          Prompt 1 &mdash; Adaptability: In-Class Reflection
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Adapting to a Scene I Didn&apos;t Expect
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            A few days ago, one of our classmate groups presented
            on &quot;Improv and Vulnerability.&quot; Geoffrey&apos;s group did
            an exercise where three people each share a meaningful object they
            carry with them, and then together the group has to build an improv
            scene that uses all three objects.
          </p>
          <p>
            I said my wallet. Not because it&apos;s interesting to look at, but
            because my dad gave it to me when I turned twenty. It felt like a
            small, quiet marker of becoming an adult. One partner said a watch,
            and another said a mechanical pencil their high school teacher had
            given them before graduation.
          </p>
          <p>
            I was genuinely nervous going into it. It was one of the first times
            we&apos;d have to actually construct and perform a real scene, not
            just play a word game or a listening exercise. I had no idea what
            kind of scene we could build from those three objects, and I kept
            running through possibilities in my head and coming up blank. I
            honestly expected myself to just freeze.
          </p>
          <p>
            Then one of my partners didn&apos;t hesitate at all. They set up a
            scene: an antique shop. They were the shopkeeper. The watch was in
            the display case. The mechanical pencil was there to write up a
            receipt. And suddenly I could see the whole thing clearly. I was a
            customer. I was there to buy the watch. My wallet fit in naturally
            as I reached for it to pay.
          </p>
          <p>
            The scene had a shape. And the moment it had a shape, I could step
            into it without thinking twice.
          </p>
          <p>
            The UCB Manual calls this &quot;Top of Your Intelligence&quot; (UCB
            Manual, p. 50) -- the idea that you respond truthfully to whatever
            stimulus is in front of you, rather than forcing something clever or
            pre-planned. That&apos;s exactly what happened. My partner gave me
            something real to react to, and I just reacted. The antique shop was
            real to me the second someone placed it there. I didn&apos;t need to
            invent the scene. I just needed someone to start it.
          </p>
          <p>
            What surprised me most was realizing my problem isn&apos;t
            creativity. It&apos;s the anxiety before the first move. When
            I&apos;m waiting for something to start, I freeze because
            there&apos;s nothing to respond to yet. But the moment there is
            something, my brain actually knows what to do. That&apos;s not how I
            would have described myself before this class. I always thought I
            needed more time to prepare before I could contribute. This scene
            made me question that.
          </p>
        </div>

        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Pirates-of-tokyo-bay-improv-comedy-show-what-the-dickens-ebisu-tokyo-japan.jpg"
            alt="An improv comedy group performing live on stage, reacting to each other in real time"
            className="w-full rounded-xl object-cover max-h-80"
          />
          <figcaption className="mt-3 text-sm text-gray-400 text-center">
            Improv comedy in action -- the scene only works when you commit and
            react honestly to what your partner gives you. (Photo by https://www.timeout.com/tokyo/things-to-do/the-pirates-of-tokyo-bay-improv-comedy-show)
          </figcaption>
        </figure>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 2 */}
      <section className="py-16 max-w-3xl">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-3">
          Prompt 2 &mdash; Adaptability: Professional Application
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          What This Has Me Thinking About Interviews
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            As a CS student, I&apos;ve gone through quite a few technical
            interviews over the past couple of years. My approach has always been
            pretty deliberate: study algorithms, practice on LeetCode, rehearse
            answers to behavioral questions. A lot of it was essentially
            scripting.
          </p>
          <p>
            And honestly, that approach has its limits. Because no interview
            actually follows your script. The interviewer asks a follow-up you
            didn&apos;t anticipate. They rephrase the problem mid-way. They say,
            &quot;Interesting, can you think of a more efficient approach?&quot;
            And if you&apos;re in script mode, that moment of redirection is
            disorienting. I&apos;ve been there. You go quiet, you double down on
            your original answer, or you apologize. None of those are great.
          </p>
          <p>
            Looking back at those moments, I think what I was missing was
            basically a &quot;Yes, And&quot; mindset. In improv, that means
            accepting what your scene partner gives you and building on it,
            rather than defending your own direction. In an interview, it would
            look something like: &quot;Yeah, that&apos;s a fair point, and I
            think we could also look at it this way...&quot; You take their
            input as information, not as a sign that you got it wrong, and you
            keep going. The conversation stays alive instead of stalling.
          </p>
          <p>
            Presence is another thing I&apos;ve been thinking about. A habit I
            had during interviews was getting ahead of myself, already thinking
            about the next question while I was still answering the current one.
            Improv has made me a lot more aware of that. Staying present means
            treating the conversation as something happening right now, not
            something you&apos;re trying to steer toward a predetermined
            destination.
          </p>
          <p>
            There&apos;s also the idea of &quot;accepting offers.&quot; When an
            interviewer gives you a hint or redirects you, that&apos;s an offer.
            In improv, blocking an offer kills the scene. In an interview, the
            equivalent is ignoring the hint and pushing forward anyway. Treating
            those moments as help rather than correction is a shift I want to
            make going into future interviews.
          </p>
          <p>
            A{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9859848/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              2022 review published in Advances in Health Sciences Education
            </a>{" "}
            looked at how professionals develop adaptive expertise, and found
            that the ability to respond effectively to novel, unexpected
            situations is one of the most consistent markers of professional
            performance across fields. What I found interesting is that it
            frames this kind of adaptability as something that gets built through
            deliberate practice in varied, unpredictable environments -- which
            sounds a lot like what improv is doing for me each week. The
            classroom is low-stakes by design, but the skill being trained is
            real.
          </p>
        </div>

        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0k7wksta8cfghy9gipy4.png"
            alt="People in a professional meeting setting, collaborating and listening to each other"
            className="w-full rounded-xl object-cover max-h-80"
          />
          <figcaption className="mt-3 text-sm text-gray-400 text-center">
            Photo by https://dev.to/michaelsolati/leetcode-vs-vibe-coding-the-reality-of-interviewing-in-2025-2582
          </figcaption>
        </figure>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 3 */}
      <section className="py-16 max-w-3xl">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-3">
          Prompt 3 &mdash; Risk-Taking: A Past Experience
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          A Risk I Took at Amazon
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            The summer before my senior year, I interned at Amazon on a team
            that worked on internal tooling for data pipelines. I was the
            youngest person on the team by a lot. Most of my colleagues had
            years of experience, and a couple of them had been at Amazon for
            over a decade. I was pretty aware of that gap.
          </p>
          <p>
            About halfway through the internship, I noticed something in the
            codebase that seemed off. The way certain data transformations were
            batched caused redundant processing every time a pipeline failed and
            had to restart. Each restart would trigger the whole batch from the
            beginning, even for data that had already been processed. I did some
            rough calculations on my own and the wasted compute per week added
            up to more than I expected.
          </p>
          <p>
            I sat on it for a few days. The system had been built by engineers
            way more senior than me, and proposing changes to something you
            didn&apos;t build, especially as an intern, feels like a specific
            kind of risk. Part of me kept thinking I was probably missing some
            context. And even if I wasn&apos;t, nobody had asked me to look at
            this.
          </p>
          <p>
            Eventually I put together a short write-up, walked through it with
            my manager, and asked for ten minutes in a team sync to share it. I
            was nervous. I had my slides ready and I knew the explanation, but
            standing up and essentially saying &quot;I think there&apos;s a
            problem here&quot; to a room of experienced engineers is its own
            thing.
          </p>
          <p>
            The response caught me off guard. One of the senior engineers said
            he&apos;d noticed the same pattern earlier that year but hadn&apos;t
            had time to dig into it. The team ended up scoping it as an actual
            project, and I got to help with the early implementation before my
            internship was over.
          </p>
        </div>

        <figure className="my-10">
          <Image
            src="/improv/amazon_internship_photo.jpeg"
            alt="With my team at Amazon during my internship"
            width={800}
            height={500}
            className="w-full rounded-xl object-cover"
          />
          <figcaption className="mt-3 text-sm text-gray-400 text-center">
            With my team at Amazon. The internship where I learned that staying
            quiet has its own kind of cost.
          </figcaption>
        </figure>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Looking back, the risk wasn&apos;t technical at all. It was social.
            It was about trusting that I had something worth saying even when I
            was the least experienced person in the room. That&apos;s something
            improv keeps coming back to. Making a bold choice means committing
            to it before you know how it will land. Holding back because you
            might be wrong is its own kind of failure, it just stays invisible.
            Nobody knows you had the idea.
          </p>
          <p>
            I think about that a lot now when I&apos;m hesitating in class. The
            stakes are different, but the pattern is the same: you have an
            instinct, and the question is whether you trust it enough to act
            before you&apos;ve talked yourself out of it.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* Prompt 4 */}
      <section className="py-16 max-w-3xl">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-3">
          Prompt 4 &mdash; Risk-Taking: An In-Class Moment
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Sharing Something I Don&apos;t Usually Bring Up
        </h2>

        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            A few days ago during class, I did a small group exercise with
            Kevin, our class TA, and one other classmate, Ben. The three of us
            were supposed to share a personal story about a specific moment when
            we realized we needed to change something about ourselves.
          </p>
          <p>
            That kind of prompt is harder than it sounds. It&apos;s not a scene
            exercise or a word game. There&apos;s no character to hide behind.
            You&apos;re just sitting there with two people, and you have to say
            something true.
          </p>
          <p>
            I shared something from high school. I was student body president,
            which was one of the first real leadership positions I&apos;d ever
            had. And early on, I handled it the way I handled most things: I
            spoke first. Whenever we were in a meeting discussing something, I
            would share my thoughts right at the start, then open it up to
            others. It felt natural. I was the president, I had thought about
            the agenda, I had opinions.
          </p>
          <p>
            But after a while I started noticing a pattern. When I spoke first,
            people would usually just agree with whatever I said. Even if I
            framed it as a question, even if I genuinely wanted their input, the
            dynamic had already been set. I was the leader and I&apos;d already
            shared my take, so people tended not to push back. The conversation
            would move on, and I&apos;d feel like we had decided something
            together, but really I had just said something and everyone had
            nodded.
          </p>
          <p>
            It took me a while to admit that this was a problem I was creating.
            Once I did, I started making a deliberate effort to change the habit:
            listen first, speak last and least. Let everyone else say what they
            actually think before I weigh in. It&apos;s something I&apos;m still
            actively working on, honestly.
          </p>
          <p>
            Sharing that story with Kevin and Ben felt like the riskiest thing
            I&apos;d done in class up to that point. Not because the story is
            particularly dramatic, but because it&apos;s a moment where I had to
            admit that I was the problem. That I thought I was being a good
            leader and I wasn&apos;t. I&apos;m not someone who naturally talks
            about that kind of thing, especially not with people I&apos;ve just
            met. I would normally keep something like that to myself and just
            move forward quietly.
          </p>
          <p>
            But I went for it. And the experience of saying it out loud, in a
            small group, and having it received without judgment -- that was
            genuinely useful. It made the thing feel smaller and more manageable
            than it had in my head.
          </p>
          <p>
            I think about that a lot in the context of professional life. As a
            software engineer working in teams, the ability to say &quot;I think
            I got this wrong&quot; or &quot;I want to hear what everyone else
            thinks before I say anything&quot; is actually a hard skill. It
            requires a certain comfort with uncertainty and with letting go of
            control. Improv has been giving me small, low-stakes opportunities
            to practice exactly that. And according to{" "}
            <a
              href="https://doi.org/10.1177/0170840604042412"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              Vera and Crossan (2004)
            </a>
            , the practice of making unscripted, real-time decisions in group
            settings directly builds the kind of flexibility you need in
            professional ones. The classroom is safe by design. But the courage
            you build there does carry over.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 max-w-3xl" />

      {/* References */}
      <section className="py-16 max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight mb-6">References</h2>

        <ol className="list-decimal list-inside space-y-5 text-gray-600 leading-relaxed">
          <li>
            Upright Citizens Brigade.{" "}
            <span className="italic">UCB Comedy Improv Manual.</span> UCB
            Theatre. (p. 50, &ldquo;Top of Your Intelligence&rdquo;)
          </li>
          <li>
            Pelgrim, E., Hissink, E., Bus, L., van der Schaaf, M., Nieuwenhuis,
            L., van Tartwijk, J., &amp; Kuijer-Siebelink, W. (2022).
            Professionals&apos; adaptive expertise and adaptive performance in
            educational and workplace settings: an overview of reviews.{" "}
            <span className="italic">
              Advances in Health Sciences Education, 27
            </span>
            (5), 1245&ndash;1263.{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9859848/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              https://pmc.ncbi.nlm.nih.gov/articles/PMC9859848/
            </a>
          </li>
          <li>
            Vera, D., &amp; Crossan, M. (2004). Theatrical improvisation:
            Lessons for organizations.{" "}
            <span className="italic">Organization Studies, 25</span>(5),
            727&ndash;749.{" "}
            <a
              href="https://doi.org/10.1177/0170840604042412"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              https://doi.org/10.1177/0170840604042412
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
            href="/improv/blog1"
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
            Blog 1
          </Link>
          <Link
            href="/improv/main"
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            Home
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
