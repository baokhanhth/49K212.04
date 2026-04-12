import { Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from '../../services/api';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getStoredUser();
    if (!user || !allowedRoles.includes(user.maVaiTro)) {
      return <Navigate to="/dang-nhap" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
