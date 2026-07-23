import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  User,
  Wrench,
  FolderKanban,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  Server,
  MessageSquareQuote,
  Mail,
  Share2,
  Search,
  Settings,
  Images,
  UserCog,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** false → shown in the sidebar with a "Soon" badge (built in a later phase) */
  ready: boolean;
};

// Full CMS navigation. Modules flip to `ready: true` as each phase lands.
export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, ready: true },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban, ready: true },
  { label: "Hero", href: "/admin/hero", icon: Sparkles, ready: true },
  { label: "About", href: "/admin/about", icon: User, ready: true },
  { label: "Skills", href: "/admin/skills", icon: Wrench, ready: true },
  { label: "Experience", href: "/admin/experience", icon: Briefcase, ready: true },
  { label: "Education", href: "/admin/education", icon: GraduationCap, ready: true },
  { label: "Certificates", href: "/admin/certificates", icon: BadgeCheck, ready: true },
  { label: "Services", href: "/admin/services", icon: Server, ready: true },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, ready: true },
  { label: "Contact Messages", href: "/admin/messages", icon: Mail, ready: true },
  { label: "Social Links", href: "/admin/social", icon: Share2, ready: true },
  { label: "SEO Settings", href: "/admin/seo", icon: Search, ready: true },
  { label: "Site Settings", href: "/admin/settings", icon: Settings, ready: true },
  { label: "Media Library", href: "/admin/media", icon: Images, ready: true },
  { label: "Profile", href: "/admin/profile", icon: UserCog, ready: true },
];
