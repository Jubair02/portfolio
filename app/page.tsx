import { site } from "@/content/site";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Services } from "@/components/sections/Services";
import { Certifications } from "@/components/sections/Certifications";
import { Testimonials } from "@/components/sections/Testimonials";
import { GitHubStats } from "@/components/sections/GitHubStats";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  email: site.email,
  image: `${site.url}/jubair-portrait.jpg`,
  description: site.subheadline,
  sameAs: [site.socials.github, site.socials.linkedin],
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "C#",
    ".NET",
    "Node.js",
    "Web Development",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Services />
      <Certifications />
      <Testimonials />
      <GitHubStats />
      <Blog />
      <Contact />
    </>
  );
}
