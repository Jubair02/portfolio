import { site } from "@/content/site";
import {
  getProjects,
  getHero,
  getAbout,
  getSkills,
  getExperience,
  getEducation,
  getServices,
  getCertificates,
  getTestimonials,
} from "@/lib/data";
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
import { SectionDivider } from "@/components/ui/SectionDivider";

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

// Revalidate periodically; admin mutations also call revalidatePath("/") for
// near-instant updates after a content change.
export const revalidate = 60;

export default async function Home() {
  const [
    projects,
    hero,
    about,
    skills,
    experience,
    education,
    services,
    certificates,
    testimonials,
  ] = await Promise.all([
    getProjects(),
    getHero(),
    getAbout(),
    getSkills(),
    getExperience(),
    getEducation(),
    getServices(),
    getCertificates(),
    getTestimonials(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero hero={hero} />
      <About about={about} />
      <Skills categories={skills} />
      <Projects projects={projects} />
      <Experience experience={experience} education={education} />
      <Services services={services} />
      <Certifications certificates={certificates} />
      <Testimonials testimonials={testimonials} />
      <SectionDivider />
      <GitHubStats />
      <Blog />
      <Contact />
    </>
  );
}
