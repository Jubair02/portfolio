import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  projects: number;
  skills: number;
  certificates: number;
  experience: number;
  education: number;
  services: number;
  testimonials: number;
  messages: number;
  unreadMessages: number;
  media: number;
  dbConnected: boolean;
};

export type ActivityEntry = {
  id: string;
  action: string;
  entity: string;
  detail: string | null;
  createdAt: Date;
};

const EMPTY: DashboardStats = {
  projects: 0,
  skills: 0,
  certificates: 0,
  experience: 0,
  education: 0,
  services: 0,
  testimonials: 0,
  messages: 0,
  unreadMessages: 0,
  media: 0,
  dbConnected: false,
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      projects,
      skills,
      certificates,
      experience,
      education,
      services,
      testimonials,
      messages,
      unreadMessages,
      media,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.certificate.count(),
      prisma.experience.count(),
      prisma.education.count(),
      prisma.service.count(),
      prisma.testimonial.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.mediaAsset.count(),
    ]);
    return {
      projects,
      skills,
      certificates,
      experience,
      education,
      services,
      testimonials,
      messages,
      unreadMessages,
      media,
      dbConnected: true,
    };
  } catch {
    return EMPTY;
  }
}

export async function getRecentActivity(limit = 8): Promise<ActivityEntry[]> {
  try {
    return await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
