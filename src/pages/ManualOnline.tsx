
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ManualOnline = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              Manual de Usuario Online
            </h1>
            <p className="text-muted-foreground">
              Guía completa para o uso da aplicación Control de Tarefas
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/help')}
          >
            Voltar a Axuda
          </Button>
        </div>

        <Tabs defaultValue="introduccion" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="introduccion">Introdución</TabsTrigger>
            <TabsTrigger value="acceso">Acceso ao sistema</TabsTrigger>
            <TabsTrigger value="interfaz">Interfaz principal</TabsTrigger>
            <TabsTrigger value="tarefas">Xestión de tarefas</TabsTrigger>
            <TabsTrigger value="tempo">Rexistro de tempo</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="faq">Preguntas frecuentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="introduccion" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">1. INTRODUCIÓN</h2>
            <p className="mb-4">
              A aplicación Control de Tarefas é unha ferramenta deseñada para a xestión eficiente de tarefas 
              e o seguimento do tempo adicado a proxectos. Este sistema permite aos usuarios organizar o seu 
              traballo, rexistrar horas adicadas a cada tarefa, e aos administradores supervisar a 
              produtividade e asignar recursos de maneira óptima.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">1.1. Requisitos técnicos</h3>
            <p className="mb-2">Para utilizar Control de Tarefas recoméndase:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Navegadores: Chrome (v90+), Firefox (v88+), Edge (v90+) ou Safari (v14+)</li>
              <li>Conexión a internet estable</li>
              <li>Resolución de pantalla mínima recomendada: 1280x720</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">1.2. Roles de usuario</h3>
            <p className="mb-2">O sistema contén tres roles principais:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Traballador</strong>: Pode ver e actualizar as súas propias tarefas, rexistrar horas e xestionar o seu perfil.</li>
              <li><strong>Director</strong>: Ademais das funcionalidades de traballador, pode crear tarefas, asignalas e ver informes de todos os usuarios.</li>
              <li><strong>Administrador</strong>: Ten acceso completo ao sistema, incluída a configuración e xestión de usuarios.</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="acceso" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">2. ACCESO AO SISTEMA</h2>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">2.1. Iniciar sesión</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Abra o seu navegador e acceda á URL proporcionada polo seu administrador.</li>
              <li>Na pantalla de inicio de sesión, introduza o seu enderezo de correo electrónico.</li>
              <li>Introduza o seu contrasinal.</li>
              <li>Faga clic no botón "Iniciar sesión".</li>
            </ol>
            <p className="mb-4">
              Se é a primeira vez que accede, é posible que necesite cambiar o seu contrasinal temporal.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">2.2. Recuperación de contrasinal</h3>
            <p className="mb-2">Se esqueceu o seu contrasinal:</p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Na pantalla de inicio de sesión, faga clic en "¿Esqueceu o seu contrasinal?".</li>
              <li>Introduza o seu correo electrónico rexistrado.</li>
              <li>Recibirá un correo con instrucións para restablecer o seu contrasinal.</li>
              <li>Siga as instrucións do correo para crear un novo contrasinal.</li>
            </ol>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">2.3. Pechar sesión</h3>
            <p className="mb-2">Para pechar sesión de forma segura:</p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Faga clic no seu nome/avatar na esquina superior dereita.</li>
              <li>Seleccione "Pechar sesión".</li>
            </ol>
          </TabsContent>
          
          {/* O contido das outras pestanas omitiuse para brevidade */}
          <TabsContent value="interfaz" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">3. INTERFAZ PRINCIPAL</h2>
            <p className="mb-4">
              Para obter información detallada sobre a interfaz principal, consulte o manual de usuario completo.
            </p>
          </TabsContent>
          
          <TabsContent value="tarefas" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">4. XESTIÓN DE TAREFAS</h2>
            <p className="mb-4">
              Para obter información detallada sobre a xestión de tarefas, consulte o manual de usuario completo.
            </p>
          </TabsContent>
          
          <TabsContent value="tempo" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">5. REXISTRO DE TEMPO</h2>
            <p className="mb-4">
              Para obter información detallada sobre o rexistro de tempo, consulte o manual de usuario completo.
            </p>
          </TabsContent>
          
          <TabsContent value="calendario" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">6. CALENDARIO</h2>
            <p className="mb-4">
              Para obter información detallada sobre o calendario, consulte o manual de usuario completo.
            </p>
          </TabsContent>
          
          <TabsContent value="faq" className="border p-6 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">7. PREGUNTAS FRECUENTES</h2>
            <p className="mb-4">
              Para obter información detallada sobre as preguntas frecuentes, consulte o manual de usuario completo.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ManualOnline;
