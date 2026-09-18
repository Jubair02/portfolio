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
  getSocialLinks,
  getSiteCopy,
  getPosts,
  type HeroData,
  type SocialLinkData,
} from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";
import { getGitHubProfile } from "@/lib/github";
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
import { SectionDivider } from "@/components/ui/SectionDivider";

/**
 * Structured data has to agree with the canonical/OG URLs, so it is built from
 * the same DB-backed origin instead of a hardcoded domain.
 */
function buildPersonJsonLd(
  hero: HeroData,
  socials: SocialLinkData[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: hero.name,
    jobTitle: hero.role,
    url: siteUrl,
    email: hero.email,
    image: new URL(hero.heroImage, `${siteUrl}/`).href,
    description: hero.subheadline,
    sameAs: socials
      .map((s) => s.url)
      .filter((url) => /^https?:\/\//i.test(url)),
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
}

// Revalidate periodically; admin mutations also call revalidatePath("/") for
// near-instant updates after a content change.
export const revalidate = 60;

export default async function Home() {
  // Site copy first: the GitHub username it holds decides which profile to fetch.
  const copy = await getSiteCopy();
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
    socials,
    siteUrl,
    github,
    posts,
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
    getSocialLinks(),
    getSiteUrl(),
    getGitHubProfile(copy.githubUsername),
    getPosts(),
  ]);

  const jsonLd = buildPersonJsonLd(hero, socials, siteUrl);
  const { sections } = copy;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero hero={hero} socials={socials} stats={copy.heroStats} repoCount={github.repoCount} />
      <About about={about} hero={hero} resumeUrl={hero.resumeUrl} note={copy.aboutNote} />
      <Skills categories={skills} heading={sections.skills} marquee={copy.techMarquee} />
      <Projects
        projects={projects.filter((p) => p.featured)}
        totalPublished={projects.length}
        heading={sections.projects}
        githubUrl={github.url}
      />
      <Experience experience={experience} education={education} heading={sections.experience} />
      <Services services={services} heading={sections.services} />
      <Certifications
        certificates={certificates}
        heading={sections.certifications}
        achievements={copy.achievements}
      />
      <Testimonials testimonials={testimonials} heading={sections.testimonials} />
      <SectionDivider />
      <GitHubStats heading={sections.github} github={github} miniProjects={copy.miniProjects} />
      <Blog heading={sections.blog} posts={posts} />
    </>
  );
}
