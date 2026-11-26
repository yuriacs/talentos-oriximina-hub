import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, EyeOff, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { downloadJson } from '@/lib/exportAllData';
import { collectMyData, deleteMyAccount } from '@/lib/myData';
import { DPO_EMAIL } from '@/lib/privacy';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  status: string;
  onChanged: () => void;
}

const CONFIRM_WORD = 'EXCLUIR';

/** Direitos do titular em um só lugar: acessar, despublicar e excluir */
export function PrivacyCenter({ status, onChanged }: Props) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const download = async () => {
    setBusy('download');
    try {
      const data = await collectMyData();
      downloadJson(data, `meus-dados-observatorio-${data.gerado_em.slice(0, 10)}.json`);
    } catch (e) {
      toast.error('Não foi possível gerar o arquivo', { description: e instanceof Error ? e.message : String(e) });
    }
    setBusy(null);
  };

  const setPublished = async (publish: boolean) => {
    setBusy('publish');
    const { error } = await db.rpc('set_my_profile_published', { _publish: publish });
    setBusy(null);
    if (error) { toast.error('Não foi possível alterar a visibilidade', { description: error.message }); return; }
    toast.success(publish ? 'Perfil publicado' : 'Perfil retirado da vitrine. Só você e a SEMJU podem vê-lo.');
    onChanged();
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await deleteMyAccount();
      await refresh();
      toast.success('Sua conta e seus dados foram excluídos.');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error('Não foi possível excluir a conta', {
        description: `${e instanceof Error ? e.message : String(e)}. Se persistir, escreva para ${DPO_EMAIL}.`,
      });
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Privacidade e meus dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Seus direitos pela LGPD. Para qualquer outro pedido, escreva para{' '}
          <a href={`mailto:${DPO_EMAIL}`} className="text-primary hover:underline">{DPO_EMAIL}</a>. Veja a{' '}
          <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={download} disabled={!!busy}>
            {busy === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar meus dados
          </Button>
          {status === 'PUBLISHED' && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setPublished(false)} disabled={!!busy}>
              <EyeOff className="h-4 w-4" /> Tirar meu perfil da vitrine
            </Button>
          )}
          <AlertDialog onOpenChange={() => setConfirmText('')}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" disabled={!!busy}>
                <Trash2 className="h-4 w-4" /> Excluir minha conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta e dados</AlertDialogTitle>
                <AlertDialogDescription>
                  Apaga de forma definitiva seu perfil, formação, competências, projetos, mensagens, foto, a empresa
                  cadastrada por você (se houver) e seu login. Não dá para desfazer. Se quiser guardar uma cópia, use
                  “Baixar meus dados” antes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor="confirm-delete">Digite {CONFIRM_WORD} para confirmar</Label>
                <Input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy === 'delete'}>Cancelar</AlertDialogCancel>
                <Button variant="destructive" onClick={remove} disabled={confirmText.trim().toUpperCase() !== CONFIRM_WORD || busy === 'delete'}>
                  {busy === 'delete' ? 'Excluindo...' : 'Excluir definitivamente'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
