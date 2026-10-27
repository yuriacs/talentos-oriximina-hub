import { describe, expect, it, vi, beforeAll } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { insert } = vi.hoisted(() => ({ insert: vi.fn(async (_row: unknown) => ({ error: null })) }));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'rh@empresa.com' }, isLoading: false, isAdmin: false, signOut: vi.fn() }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: null, error: null }),
    insert,
  };
  return { supabase: { from: () => query, storage: { from: () => ({}) } } };
});

import CadastroEmpresa from '@/pages/CadastroEmpresa';

beforeAll(() => {
  // Radix (Select) usa APIs de ponteiro que o jsdom não tem
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
});

const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function pick(label: RegExp, option: string) {
  const trigger = screen.getByRole('combobox', { name: label });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: option }));
}

const next = () => act(async () => { fireEvent.click(screen.getByRole('button', { name: /continuar/i })); });

describe('Cadastro de empresa', () => {
  it('valida cada etapa, não envia com Enter e grava os dados normalizados', async () => {
    render(<MemoryRouter><CadastroEmpresa /></MemoryRouter>);
    await screen.findByText('Sobre a empresa');

    // Etapa 1 vazia: não avança e mostra o que falta
    await next();
    expect(await screen.findByText('Informe o nome da empresa')).toBeInTheDocument();
    expect(screen.getByText('Sobre a empresa')).toBeInTheDocument();

    type(/nome da empresa/i, 'Mercadinho Boa Vista');
    type(/^cnpj/i, '11222333000182');
    type(/razão social/i, 'Boa Vista Comércio Ltda');
    await pick(/setor/i, 'Comércio');
    await pick(/porte/i, 'Microempresa');
    await next();
    expect(await screen.findByText(/CNPJ inválido/)).toBeInTheDocument();
    expect((screen.getByLabelText(/^cnpj/i) as HTMLInputElement).value).toBe('11.222.333/0001-82');

    type(/^cnpj/i, '11222333000181');
    await next();
    await screen.findByText('Contato e endereço');

    // E-mail da conta vem preenchido; Enter num campo não envia o formulário
    expect((screen.getByLabelText(/e-mail de contato/i) as HTMLInputElement).value).toBe('rh@empresa.com');
    await act(async () => { fireEvent.keyDown(screen.getByLabelText(/cargo/i), { key: 'Enter' }); });
    expect(await screen.findByText(/nome de quem vai falar/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();

    type(/responsável pelo contato/i, 'Ana Souza');
    type(/whatsapp/i, '93999998888');
    type(/^site/i, 'www.boavista.com.br');
    type(/instagram/i, '@boavista');
    await next();
    await screen.findByText('Que oportunidades vocês oferecem?');

    await next();
    expect(await screen.findByText('Escolha pelo menos uma modalidade')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Estágio' }));
    await next();
    await screen.findByText('Selo Empresa Amiga da Juventude');

    fireEvent.click(screen.getByRole('button', { name: /cursos de formação/i }));
    await next();
    await screen.findByText('Revise e aceite o termo');
    expect(screen.getByText('Mercadinho Boa Vista')).toBeInTheDocument();
    expect(screen.getByText('rh@empresa.com · (93) 99999-8888')).toBeInTheDocument();

    // Sem aceitar o termo: mostra o erro em vez de "não fazer nada"
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /enviar cadastro/i })); });
    expect(await screen.findByText(/precisa aceitar o termo/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /enviar cadastro/i })); });
    await screen.findByText('Cadastro enviado!');

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'u1',
      cnpj: '11222333000181',
      site_url: 'https://www.boavista.com.br',
      instagram_url: 'https://instagram.com/boavista',
      whatsapp: '(93) 99999-8888',
      modalidades_vaga: ['Estágio'],
      setor_atividade: 'Comércio',
      termo_aceito: true,
    }));
  }, 20000);
});
