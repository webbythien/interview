import { Navigate, Outlet } from "react-router-dom";
import { Stack } from '@mui/material';
import SideBar from "./SideBar";

const DashboardLayout = () => {
  // Kiểm tra localStorage để xác định nếu người dùng đã đăng nhập
  const isAuthenticated = !!(localStorage.getItem('uuid') && localStorage.getItem('username'));

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' />;
  }

  return (
    <Stack direction='row'>
      {/* SideBar */}
      <SideBar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;
