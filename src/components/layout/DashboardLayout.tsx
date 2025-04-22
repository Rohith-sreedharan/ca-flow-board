
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { RootState } from '@/store';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 p-6",
            sidebarCollapsed ? "ml-[80px]" : "ml-64"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
