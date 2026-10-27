import { describe, expect, it, vi, beforeAll } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { updateProfile, addSkill } = vi.hoisted(() => ({
  updateProfile: vi.fn(async (_u: unknown) => ({ error: null })),
  addSkill: vi.fn(async (_s: unknown) => ({ error: null })),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'jovem@email.com' }, isLoading: false, isAdmin: false, signOut: vi.fn() }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: {
      id: 'p1', user_id: 'u1', full_name: 'Maria Silva', status: 'DRAFT', bio: '', professional_objective: '',
      city: 'Oriximiná', whatsapp: '', contact_visibility: 'INTERNAL_ONLY', photo: null,
    },
    skills: [], education: [], experiences: [], projects: [], certifications: [], languages: [], availability: [],
    loading: false,
    updateProfile, addSkill,
    deleteSkill: vi.fn(), addEducation: vi.fn(), deleteEducation: vi.fn(), addExperience: vi.fn(),
    deleteExperience: vi.fn(), addProject: vi.fn(), deleteProject: vi.fn(), toggleAvailability: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

import EditarPerfil from '@/pages/EditarPerfil';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.hasPointerCapture = () => false;
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
});

const continuar = () => act(async () => { fireEvent.click(screen.getByRole('button', { name: /salvar e continuar/i })); });

describe('Meu Perfil em etapas', () => {
  it('salva a etapa ao continuar, inclusive o que foi digitado sem clicar em adicionar', async () => {
    render(<MemoryRouter initialEntries={['/meu-perfil']}><EditarPerfil /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '1. Sobre você' })).toBeInTheDocument();
    // Um único botão por etapa, sem "Salvar" em cada cartão
    expect(screen.queryByRole('button', { name: /salvar informações/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Ex\.: Tenho 20 anos/), { target: { value: 'Estudo Administração.' } });
    fireEvent.change(screen.getByPlaceholderText('(93) 99999-9999'), { target: { value: '93999998888' } });
    await continuar();

    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      bio: 'Estudo Administração.',
      whatsapp: '(93) 99999-8888',
      contact_visibility: 'HIDDEN',
    }));
    await screen.findByRole('heading', { name: '2. Estudo e trabalho' });

    // Sem alterações: continuar não salva de novo
    await continuar();
    await screen.findByRole('heading', { name: '3. Formação' });
    expect(updateProfile).toHaveBeenCalledTimes(1);

    await continuar();
    await screen.findByRole('heading', { name: '4. Competências' });
    fireEvent.change(screen.getByPlaceholderText('Nome da competência'), { target: { value: 'Excel' } });
    await continuar();
    await waitFor(() => expect(addSkill).toHaveBeenCalledWith(expect.objectContaining({ name: 'Excel' })));
    await screen.findByRole('heading', { name: '5. Preferências' });
  });

  it('só libera a publicação com os itens obrigatórios', async () => {
    render(<MemoryRouter initialEntries={['/meu-perfil?etapa=publicar']}><EditarPerfil /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /publicar meu perfil/i })).toBeDisabled();
    expect(screen.getAllByText('obrigatório')).toHaveLength(5);

    // O item pendente leva direto para a etapa onde se completa
    fireEvent.click(screen.getByRole('button', { name: /5 ou mais competências/i }));
    await screen.findByRole('heading', { name: '4. Competências' });
  });
});
