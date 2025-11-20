import { useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import ResponsiveStudentHeader from "@/components/ResponsiveStudentHeader";

interface StudentLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  planType: string;
  onLogout: () => void;
}

export default function StudentLayoutWrapper({ 
  children, 
  userName, 
  userEmail, 
  avatarUrl, 
  planType, 
  onLogout 
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Sidebar */}
      <StudentSidebar 
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        planType={planType}
      />

      {/* Main Content Area */}
      <div className="relative md:ml-64">
        {/* Header */}
        <ResponsiveStudentHeader
          userName={userName}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          planType={planType}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="pt-4 md:pt-6 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}