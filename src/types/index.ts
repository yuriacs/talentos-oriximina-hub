// Observatório da Juventude - Types

export type UserRole = 'YOUTH' | 'ADMIN';
export type ProfileStatus = 'DRAFT' | 'PUBLISHED' | 'BLOCKED';
export type SkillLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';
export type SkillCategory = 'HARD' | 'SOFT';
export type AvailabilityType = 'ESTAGIO' | 'FREELANCE' | 'VOLUNTARIO' | 'PROJETO' | 'MENTORIA';
export type ContactVisibility = 'INTERNAL_ONLY' | 'EMAIL_LOGGED' | 'WHATSAPP_LOGGED' | 'ALL' | 'HIDDEN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}

export interface YouthProfile {
  id: string;
  userId: string;
  fullName: string;
  photo?: string;
  bio: string;
  city: string;
  professionalObjective: string;
  status: ProfileStatus;
  isVerified: boolean;
  profileCompletion: number;
  contactVisibility: ContactVisibility;
  whatsapp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  profileId: string;
  level: string;
  course: string;
  institution: string;
  year: number;
  current: boolean;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface Experience {
  id: string;
  profileId: string;
  type: string;
  place: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

export interface Project {
  id: string;
  profileId: string;
  title: string;
  problem: string;
  solution: string;
  technologies: string[];
  results?: string;
  links?: string[];
  images?: string[];
  createdAt: Date;
}

export interface Certification {
  id: string;
  profileId: string;
  course: string;
  institution: string;
  hours: number;
  attachmentUrl?: string;
  completedAt: Date;
}

export interface Language {
  id: string;
  profileId: string;
  name: string;
  level: 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'FLUENTE' | 'NATIVO';
}

export interface Availability {
  id: string;
  profileId: string;
  type: AvailabilityType;
  description?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedProfileId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  resolvedAt?: Date;
}

// Mock data types for display
export interface ProfileCardData {
  id: string;
  fullName: string;
  photo?: string;
  bio: string;
  city: string;
  professionalObjective: string;
  skills: Skill[];
  isVerified: boolean;
  projectCount: number;
  availability: AvailabilityType[];
}
