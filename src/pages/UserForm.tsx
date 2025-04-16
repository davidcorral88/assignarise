import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getUserById, addUser, updateUser, getNextUserId } from '../utils/dataService';
import { User, UserRole } from '../utils/types';
import { toast } from '@/components/ui/use-toast';

type OrganizationType = 'Xunta' | 'iPlan' | undefined;

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [active, setActive] = useState(true);
  const [userId, setUserId] = useState<number>(0);
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [emailATSXPTPG, setEmailATSXPTPG] = useState('');
  const [organization, setOrganization] = useState<OrganizationType>(undefined);
  const [emailNotification, setEmailNotification] = useState<'S' | 'N'>('N');
  
  // Load user data if in edit mode
  useEffect(() => {
    const loadUser = async () => {
      if (isEditMode && id) {
        try {
          // Parse the ID string to number
          const numericId = parseInt(id, 10);
          const userData = await getUserById(numericId);
          if (userData) {
            setName(userData.name);
            setEmail(userData.email);
            setRole(userData.role);
            setActive(userData.active !== false);
            setUserId(userData.id);
            setAvatar(userData.avatar || '');
            setPhone(userData.phone || '');
            setEmailATSXPTPG(userData.emailATSXPTPG || '');
            
            // Debug the raw userData to see what we're getting
            console.log('Raw user data from API:', userData);
            
            // Correctly handle organization field, looking at both possible fields
            // and ensure we properly cast it as OrganizationType
            const orgValue = userData.organization || userData.organism;
            console.log('Organization value from API data:', orgValue);
            
            if (orgValue === 'Xunta' || orgValue === 'iPlan') {
              setOrganization(orgValue);
            } else {
              setOrganization(undefined);
            }
            
            // Debug statement to verify that organization data is being loaded
            console.log('User data loaded:', userData);
            console.log('Organization state after setting:', orgValue);
            
            // Debug email notification value
            console.log('Email notification value from API:', userData.email_notification);
            
            setEmailNotification(userData.email_notification === true ? 'S' : 'N');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          toast({
            title: 'Error',
            description: 'Non se puido cargar os datos do usuario.',
            variant: 'destructive',
          });
        }
      } else {
        // For new users, generate ID
        const getNewId = async () => {
          const nextId = await getNextUserId();
          setUserId(nextId);
        };
        getNewId();
      }
    };
    
    loadUser();
  }, [id, isEditMode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !role) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isEditMode && (!password || !confirmPassword)) {
      toast({
        title: 'Error',
        description: 'Por favor, introduce y confirma la contraseña.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isEditMode && password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }
    
    const userData: User = {
      id: userId,
      name,
      email,
      password: password || '', // Password not required in edit mode
      role,
      active,
      avatar: avatar || null,
      phone: phone || '',
      emailATSXPTPG: emailATSXPTPG || '',
      organization: organization || undefined,
      email_notification: emailNotification === 'S'
    };
    
    // Log the data being submitted
    console.log('Submitting user data:', userData);
    
    try {
      if (isEditMode) {
        // Fix: Pass user ID and user data as separate arguments
        await updateUser(userId, userData);
        toast({
          title: 'Usuario actualizado',
          description: 'El usuario se ha actualizado correctamente.',
        });
      } else {
        await addUser(userData);
        toast({
          title: 'Usuario creado',
          description: 'El usuario se ha creado correctamente.',
        });
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario.',
        variant: 'destructive',
      });
    }
  };
  
  // Debug organization field
  useEffect(() => {
    console.log('Organization state value:', organization);
  }, [organization]);
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#007bc4" }}>
          {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
        </h1>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {!isEditMode && (
            <>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmar Contraseña:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Rol:
            </label>
            <select
              id="role"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value="admin">Admin</option>
              <option value="director">Director</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="active" className="inline-flex items-center">
              <input
                type="checkbox"
                id="active"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="ml-2 text-gray-700 text-sm font-bold">Activo</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label htmlFor="avatar" className="block text-gray-700 text-sm font-bold mb-2">
              Avatar URL:
            </label>
            <input
              type="text"
              id="avatar"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Teléfono:
            </label>
            <input
              type="text"
              id="phone"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="emailATSXPTPG" className="block text-gray-700 text-sm font-bold mb-2">
              Email ATSXTPG:
            </label>
            <input
              type="email"
              id="emailATSXPTPG"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={emailATSXPTPG}
              onChange={(e) => setEmailATSXPTPG(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="organization" className="block text-gray-700 text-sm font-bold mb-2">
              Organización:
            </label>
            <select
              id="organization"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={organization || ''}
              onChange={(e) => setOrganization(e.target.value === '' ? undefined : e.target.value as OrganizationType)}
            >
              <option value="">Selecciona unha organización</option>
              <option value="Xunta">Xunta</option>
              <option value="iPlan">iPlan</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email_notification" className="block text-gray-700 text-sm font-bold mb-2">
              Notificacións por email:
            </label>
            <select
              id="email_notification"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={emailNotification}
              onChange={(e) => setEmailNotification(e.target.value as 'S' | 'N')}
            >
              <option value="S">Si</option>
              <option value="N">Non</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate('/users')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserForm;
