import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

// Cada seção do "Meu Perfil" se registra aqui; o botão "Salvar e continuar" da etapa
// salva de uma vez tudo o que foi alterado, sem um botão de salvar por cartão.

interface Saver {
  isDirty: () => boolean;
  save: () => Promise<boolean>;
}

interface StepSaveApi {
  register: (key: string, saver: Saver) => () => void;
}

const StepSaveContext = createContext<StepSaveApi | null>(null);

export function useStepSaveController() {
  const savers = useRef(new Map<string, Saver>());

  const api = useMemo<StepSaveApi>(() => ({
    register: (key, saver) => {
      savers.current.set(key, saver);
      return () => savers.current.delete(key);
    },
  }), []);

  const hasChanges = useCallback(() => [...savers.current.values()].some(s => s.isDirty()), []);

  /** Salva as seções alteradas; devolve false se alguma falhar (o erro já foi mostrado). */
  const saveAll = useCallback(async () => {
    const dirty = [...savers.current.values()].filter(s => s.isDirty());
    const results = await Promise.all(dirty.map(s => s.save()));
    return { ok: results.every(Boolean), saved: dirty.length };
  }, []);

  return { api, hasChanges, saveAll };
}

export function StepSaveProvider({ api, children }: { api: StepSaveApi; children: ReactNode }) {
  return <StepSaveContext.Provider value={api}>{children}</StepSaveContext.Provider>;
}

/**
 * Registra a seção na etapa atual. `form` é o estado editável e `save` grava no banco.
 * Devolve `inWizard`: dentro das etapas o cartão esconde o próprio botão de salvar.
 * `clearsAfterSave`: formulário de adicionar item (habilidade, projeto...), que se esvazia ao salvar.
 */
export function useStepSave(key: string, form: unknown, save: () => Promise<boolean>, clearsAfterSave = false) {
  const ctx = useContext(StepSaveContext);
  const snapshot = useRef(JSON.stringify(form));
  const latest = useRef({ form, save });
  latest.current = { form, save };

  useEffect(() => {
    if (!ctx) return;
    return ctx.register(key, {
      isDirty: () => JSON.stringify(latest.current.form) !== snapshot.current,
      save: async () => {
        const ok = await latest.current.save();
        // Formulário de adicionar item volta a ficar vazio, que é o próprio estado inicial
        if (ok && !clearsAfterSave) snapshot.current = JSON.stringify(latest.current.form);
        return ok;
      },
    });
  }, [ctx, key, clearsAfterSave]);

  return { inWizard: !!ctx };
}
