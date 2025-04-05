import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/authStore';
import { UserRole } from '@/store/authStore';

export function useRoleProtection(allowedRoles: UserRole[]) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { user, token, isAuthenticated, loadUser, getAuthHeader } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      if (!isAuthenticated) {
        await loadUser(getAuthHeader());
      }

      if (!user || !token) {
        router.replace('/login');
        return;
      }

      const hasPermission = allowedRoles.includes(user.role as UserRole);
      setIsAuthorized(hasPermission);

      if (!hasPermission) {
        switch (user.role) {
          case 'student':
            router.replace('/');
            break;
          case 'vendor':
            router.replace('/vendor/inventory');
            break;
          case 'admin':
            router.replace('/admin/orders');
            break;
          default:
            router.replace('/login');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [user, token, isAuthenticated]);

  return { isLoading, isAuthorized };
}

export default useRoleProtection;
