
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Folder, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ManualFile {
  name: string;
  path: string;
  size?: string;
}

const Help = () => {
  const [manualFiles, setManualFiles] = useState<ManualFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // En un caso real, obtendríamos la lista de ficheiros desde unha API
    // Aquí simulamos un pequeno atraso para imitar unha obtención de datos
    const fetchManualFiles = async () => {
      // Simulamos a obtención de datos da carpeta /public/manual/
      const files: ManualFile[] = [
        {
          name: "manual_usuario_Rexistro_de_Tarefas_vGAL.docx",
          path: "/manual/manual_usuario_Rexistro_de_Tarefas_vGAL.docx",
          size: "1.2 MB"
        }
      ];
      
      setTimeout(() => {
        setManualFiles(files);
        setLoading(false);
      }, 500);
    };

    fetchManualFiles();
  }, []);

  const handleDownload = (file: ManualFile) => {
    // Crear un enlace para a descarga
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Descargando ficheiro',
      description: `Estás descargando: ${file.name}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Axuda</h1>
          <p className="text-muted-foreground">
            Documentación e recursos para o uso da aplicación
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="mr-2 h-5 w-5 text-primary" />
              Manuais de usuario
            </CardTitle>
            <CardDescription>
              Descarga a documentación oficial da aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {manualFiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Non se atoparon ficheiros de documentación
                  </p>
                ) : (
                  manualFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          {file.size && <p className="text-xs text-muted-foreground">{file.size}</p>}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center" 
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  ))
                )}
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">Manual de usuario (online)</p>
                      <p className="text-xs text-muted-foreground">Documento de referencia en liña</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => window.open('/help/manual', '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver online
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              Soporte técnico
            </CardTitle>
            <CardDescription>
              Contacta co equipo de soporte para resolver as túas dúbidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Correo electrónico:</span>
                <span className="text-muted-foreground">soporte@controltarefas.gal</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Teléfono:</span>
                <span className="text-muted-foreground">+34 981 000 000</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Horario de atención:</span>
                <span className="text-muted-foreground">Luns a venres, de 9:00 a 14:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;
