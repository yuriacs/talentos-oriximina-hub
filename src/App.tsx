import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Explorar from "./pages/Explorar";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Sobre from "./pages/Sobre";
import ComoFunciona from "./pages/ComoFunciona";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import EditarPerfil from "./pages/EditarPerfil";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminCompanies from "./pages/admin/AdminCompanies";
import CadastroEmpresa from "./pages/CadastroEmpresa";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/perfil/:id" element={<Perfil />} />
            <Route path="/meu-perfil" element={<EditarPerfil />} />
            <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="perfis" element={<AdminProfiles />} />
              <Route path="denuncias" element={<AdminReports />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
