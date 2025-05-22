
# Role Migration Instructions

## Background
La aplicación anteriormente utilizaba el rol 'director', que ha sido reemplazado por dos nuevos roles: 'dxm' y 'xerenteATSXPTPG' en la definición del tipo `UserRole`. Este cambio requiere actualizaciones en múltiples archivos para garantizar la coherencia de tipos y la correcta visualización.

## Files Updated
Los siguientes archivos se han actualizado para reemplazar las comprobaciones de rol 'director' con los nuevos roles 'dxm' y 'xerenteATSXPTPG':

1. ✅ src/utils/types.d.ts - Definición de tipos actualizada
2. ✅ src/utils/types.ts - Definición de tipos actualizada
3. ✅ src/components/auth/AuthContext.tsx - Actualización de la lógica de autenticación
4. ✅ src/components/layout/Header.tsx - Visualización del rol en la interfaz
5. ✅ src/components/layout/Navigation.tsx - Permisos basados en roles
6. ✅ src/pages/UserProfile.tsx - Visualización del perfil del usuario
7. ✅ src/pages/UserForm.tsx - Formulario de creación/edición de usuarios
8. ✅ src/pages/UserConfig.tsx - Configuración del usuario

## Changes Made
En cada archivo, todas las comparaciones de roles como:
```typescript
currentUser?.role === 'director'
```

Fueron reemplazadas con:
```typescript
currentUser?.role === 'dxm' || currentUser?.role === 'xerenteATSXPTPG'
```

Todas las referencias de texto en la interfaz de usuario a 'Director' se cambiaron para mostrar 'DXM' o 'Xerente ATSXPTPG' según corresponda.

## Migration Complete
La migración ha sido completada y todos los errores de TypeScript relacionados con la comparación del tipo UserRole con el literal de cadena 'director' han sido resueltos.
