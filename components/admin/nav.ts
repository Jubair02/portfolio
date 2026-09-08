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
  Newspaper,
  Mail,
  Share2,
  Search,
  Settings,
  Type,
  Images,
  DatabaseBackup,
  History,
  UserCog,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Hero", href: "/admin/hero", icon: Sparkles },
  { label: "About", href: "/admin/about", icon: User },
  { label: "Skills", href: "/admin/skills", icon: Wrench },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Education", href: "/admin/education", icon: GraduationCap },
  { label: "Certificates", href: "/admin/certificates", icon: BadgeCheck },
  { label: "Services", href: "/admin/services", icon: Server },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Blog Posts", href: "/admin/posts", icon: Newspaper },
  { label: "Contact Messages", href: "/admin/messages", icon: Mail },
  { label: "Social Links", href: "/admin/social", icon: Share2 },
  { label: "SEO Settings", href: "/admin/seo", icon: Search },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
  { label: "Site Copy", href: "/admin/copy", icon: Type },
  { label: "Media Library", href: "/admin/media", icon: Images },
  { label: "Backup & Restore", href: "/admin/backup", icon: DatabaseBackup },
  { label: "Activity Log", href: "/admin/activity", icon: History },
  { label: "Profile", href: "/admin/profile", icon: UserCog },
];
