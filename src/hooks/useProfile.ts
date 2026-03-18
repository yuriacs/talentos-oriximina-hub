import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Skill = Tables<'skills'>;
type Education = Tables<'education'>;
type Experience = Tables<'experiences'>;
type Project = Tables<'projects'>;
type Certification = Tables<'certifications'>;
type Language = Tables<'languages'>;
type Availability = Tables<'availability'>;

interface SoftSkill {
  id: string;
  profile_id: string;
  name: string;
  rating: number;
  created_at: string;
}

export interface ProfileData {
  profile: Profile | null;
  skills: Skill[];
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  availability: Availability[];
  softSkills: SoftSkill[];
}

export function useProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData>({
    profile: null, skills: [], education: [], experiences: [],
    projects: [], certifications: [], languages: [], availability: [],
    softSkills: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    const profileId = profile.id;
    const [skills, education, experiences, projects, certifications, languages, availability, softSkillsRes] = await Promise.all([
      supabase.from('skills').select('*').eq('profile_id', profileId),
      supabase.from('education').select('*').eq('profile_id', profileId),
      supabase.from('experiences').select('*').eq('profile_id', profileId),
      supabase.from('projects').select('*').eq('profile_id', profileId),
      supabase.from('certifications').select('*').eq('profile_id', profileId),
      supabase.from('languages').select('*').eq('profile_id', profileId),
      supabase.from('availability').select('*').eq('profile_id', profileId),
      supabase.from('soft_skills' as any).select('*').eq('profile_id', profileId) as any,
    ]);

    setData({
      profile,
      skills: skills.data || [],
      education: education.data || [],
      experiences: experiences.data || [],
      projects: projects.data || [],
      certifications: certifications.data || [],
      languages: languages.data || [],
      availability: availability.data || [],
      softSkills: ((softSkillsRes as any).data || []) as SoftSkill[],
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('profiles').update(updates).eq('id', data.profile.id);
    if (!error) await fetchAll();
    return { error };
  };

  const addSkill = async (skill: Omit<TablesInsert<'skills'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('skills').insert({ ...skill, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const addEducation = async (edu: Omit<TablesInsert<'education'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('education').insert({ ...edu, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteEducation = async (id: string) => {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const addExperience = async (exp: Omit<TablesInsert<'experiences'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('experiences').insert({ ...exp, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteExperience = async (id: string) => {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const addProject = async (proj: Omit<TablesInsert<'projects'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('projects').insert({ ...proj, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const addCertification = async (cert: Omit<TablesInsert<'certifications'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('certifications').insert({ ...cert, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteCertification = async (id: string) => {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const addLanguage = async (lang: Omit<TablesInsert<'languages'>, 'profile_id'>) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await supabase.from('languages').insert({ ...lang, profile_id: data.profile.id });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteLanguage = async (id: string) => {
    const { error } = await supabase.from('languages').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const toggleAvailability = async (type: TablesInsert<'availability'>['type']) => {
    if (!data.profile) return { error: 'No profile' };
    const existing = data.availability.find(a => a.type === type);
    if (existing) {
      const { error } = await supabase.from('availability').delete().eq('id', existing.id);
      if (!error) await fetchAll();
      return { error };
    } else {
      const { error } = await supabase.from('availability').insert({ type, profile_id: data.profile.id });
      if (!error) await fetchAll();
      return { error };
    }
  };

  // Soft skills CRUD
  const addSoftSkill = async (skill: { name: string; rating: number }) => {
    if (!data.profile) return { error: 'No profile' };
    const { error } = await (supabase.from('soft_skills' as any) as any).insert({
      name: skill.name,
      rating: skill.rating,
      profile_id: data.profile.id,
    });
    if (!error) await fetchAll();
    return { error };
  };

  const updateSoftSkill = async (id: string, rating: number) => {
    const { error } = await (supabase.from('soft_skills' as any) as any).update({ rating }).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteSoftSkill = async (id: string) => {
    const { error } = await (supabase.from('soft_skills' as any) as any).delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return {
    ...data, loading, refetch: fetchAll,
    updateProfile, addSkill, deleteSkill,
    addEducation, deleteEducation,
    addExperience, deleteExperience,
    addProject, deleteProject,
    addCertification, deleteCertification,
    addLanguage, deleteLanguage,
    toggleAvailability,
    addSoftSkill, updateSoftSkill, deleteSoftSkill,
  };
}
