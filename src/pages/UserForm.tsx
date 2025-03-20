
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft, Save, Clock, User as UserIcon, Shield, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getUserById, addUser, updateUser, getNextUserId } from '../utils/dataService';
import { User, UserRole } from '../utils/types';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OrganismType = 'Xunta' | 'iPlan' | '';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [phone, setPhone] = useState('');
  const [emailATSXPTPG, setEmailATSXPTPG] = useState('');
  const [organism, setOrganism] = useState<OrganismType>('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextId, setNextId] = useState<string>('');
  
  useEffect(() => {
    // Only managers can access this page
    if (currentUser?.role !== 'manager') {
      navigate('/dashboard');
    }
    
    const loadData = async () => {
      if (isEditing && id) {
        const user = await getUserById(id);
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setRole(user.role);
          setPhone(user.phone || '');
          setEmailATSXPTPG(user.emailATSXPTPG || '');
          setOrganism(user.organism || '');
          setActive(user.active !== false); // If active is undefined, treat as true
        }
      } else {
        // Get next available ID for new users
        try {
          const nextUserId = await getNextUserId();
          setNextId(String(nextUserId));
        } catch (error) {
          console.error("Error getting next user ID:", error);
          setNextId('');
        }
      }
      setLoading(false);
    };
    
    loadData();
  }, [id, isEditing, currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, completa todos os campos requiridos',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Erro',
        description: 'Por favor, introduce un email válido',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate ATSXPTPG email if provided
    if (emailATSXPTPG && !emailRegex.test(emailATSXPTPG)) {
      toast({
        title: 'Erro',
        description: 'Por favor, introduce un email ATSXPTPG válido',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create the user object
      const user: User = {
        id: isEditing && id ? id : nextId || String(Date.now()),
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        phone: phone || undefined,
        emailATSXPTPG: emailATSXPTPG || undefined,
        organism: organism as 'Xunta' | 'iPlan' | undefined,
        active: active
      };
      
      // Save the user
      if (isEditing) {
        await updateUser(user);
      } else {
        await addUser(user);
      }
      
      toast({
        title: isEditing ? 'Usuario actualizado' : 'Usuario creado',
        description: isEditing ? 'O usuario foi actualizado correctamente.' : 'O usuario foi creado correctamente.',
      });
      
      // Navigate back to users list
      setTimeout(() => {
        navigate('/users');
        setSubmitting(false);
      }, 800);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar el usuario. Consulte la consola para más detalles.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent" 
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar usuario' : 'Novo usuario'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Información do usuario</CardTitle>
              <CardDescription>
                Introduce os detalles do usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Información básica</TabsTrigger>
                  <TabsTrigger value="contact">Contacto e organización</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Introduce o nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@exemplo.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="worker" id="worker" />
                        <Label htmlFor="worker" className="flex items-center cursor-pointer">
                          <UserIcon className="mr-1.5 h-4 w-4" />
                          Traballador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manager" id="manager" />
                        <Label htmlFor="manager" className="flex items-center cursor-pointer">
                          <Shield className="mr-1.5 h-4 w-4" />
                          Xerente
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="active" 
                        checked={active} 
                        onCheckedChange={(checked) => setActive(checked === true)}
                      />
                      <Label htmlFor="active" className="font-medium cursor-pointer">
                        Usuario activo
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Os usuarios inactivos non poderán acceder á aplicación
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Introduce o teléfono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailATSXPTPG">Email ATSXPTPG</Label>
                    <Input
                      id="emailATSXPTPG"
                      type="email"
                      value={emailATSXPTPG}
                      onChange={(e) => setEmailATSXPTPG(e.target.value)}
                      placeholder="correo@atsxptpg.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organism">Organismo</Label>
                    <Select 
                      value={organism} 
                      onValueChange={(value: OrganismType) => setOrganism(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un organismo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ningún</SelectItem>
                        <SelectItem value="Xunta">Xunta</SelectItem>
                        <SelectItem value="iPlan">iPlan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Nota: </span>
                  {role === 'manager' 
                    ? 'Os xerentes poden crear, ver e editar todas as tarefas e usuarios no sistema.' 
                    : 'Os traballadores só poden ver, crear e editar as súas propias tarefas asignadas.'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Actualizar usuario' : 'Crear usuario'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default UserForm;
