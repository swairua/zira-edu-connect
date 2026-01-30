import { useState } from 'react';
import { Sparkles, ArrowRight, GraduationCap, Users, BookOpen, LayoutDashboard, Eye, Calculator } from 'lucide-react';
 
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DemoModeBannerProps {
  portalType?: 'student' | 'parent' | 'teacher' | 'staff' | 'finance' | 'accountant';
}

export function DemoModeBanner({ portalType }: DemoModeBannerProps) {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleDemoSwitch = async (viewType: 'student' | 'parent' | 'teacher' | 'admin' | 'accountant') => {
    // Already on this portal
    if (viewType === portalType) return;

    setIsSwitching(true);
    
    try {
      if (viewType === 'admin') {
        // Sign in as demo admin
        await supabase.auth.signInWithPassword({
          email: 'demo@zira.tech',
          password: 'DemoAccess2024!',
        });
        window.location.href = '/dashboard';
        return;
      }
      
      if (viewType === 'teacher') {
        // Sign in as demo teacher
        const { error } = await supabase.auth.signInWithPassword({
          email: 'teacher.demo@zira.tech',
          password: 'DemoTeacher2024!',
        });
        if (error) {
          toast.error('Demo teacher account not yet available');
          setIsSwitching(false);
          return;
        }
        window.location.href = '/portal';
        return;
      }

      if (viewType === 'accountant') {
        // Sign in as demo accountant/finance officer
        const { error } = await supabase.auth.signInWithPassword({
          email: 'accountant.demo@zira.tech',
          password: 'DemoAccountant2024!',
        });
        if (error) {
          toast.error('Demo accountant account not yet available');
          setIsSwitching(false);
          return;
        }
        window.location.href = '/portal/finance';
        return;
      }

      // Student or Parent - use OTP-based demo access
      const { data, error } = await supabase.functions.invoke('demo-portal-access', {
        body: { userType: viewType }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to switch view');

      // Store session tokens with the correct keys that auth contexts expect
      if (viewType === 'student') {
        localStorage.setItem('student_session_token', data.token);
        localStorage.setItem('student_session_expiry', data.expiresAt);
      } else if (viewType === 'parent') {
        localStorage.setItem('parent_session_token', data.token);
        localStorage.setItem('parent_session_expiry', data.expiresAt);
        localStorage.setItem('parent_session_data', JSON.stringify({
          parent: data.user || data.userData,
          institution: data.institution,
          isDemo: true,
        }));
        localStorage.setItem('parent_session_verified', 'true');
      }

      // Use hard navigation to ensure auth contexts re-initialize
      window.location.href = `/${viewType}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch demo view');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleStartFreeTrial = async () => {
    // Clear all demo sessions
    localStorage.removeItem('student_session_token');
    localStorage.removeItem('student_session_expiry');
    localStorage.removeItem('parent_session_token');
    localStorage.removeItem('parent_session_expiry');
    localStorage.removeItem('parent_session_data');
    
    // Sign out from Supabase Auth (demo admin/teacher sessions)
    await supabase.auth.signOut();
    
    // Navigate to signup
    window.location.href = '/auth?tab=signup';
  };

  const isFinanceView = portalType === 'finance' || portalType === 'accountant' || portalType === 'staff';

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse" />
          <span className="text-sm font-medium truncate">
            <span className="hidden sm:inline">
              You are viewing a <strong>Demo Account</strong> — Data resets daily. Explore all features freely!
            </span>
            <span className="sm:hidden">
              <strong>Demo Mode</strong> — Explore freely!
            </span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop View Switcher */}
          <div className="hidden lg:flex items-center gap-1 mr-2 border-r border-white/30 pr-3">
            <span className="text-xs text-white/80 mr-2">Switch view:</span>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-white hover:bg-white/20 text-xs h-7 px-2"
              onClick={() => handleDemoSwitch('admin')}
              disabled={isSwitching}
            >
              <LayoutDashboard className="h-3 w-3 mr-1" />
              Admin
            </Button>
            {!isFinanceView && (
              <Button 
                size="sm" 
                variant="ghost"
                className="text-white hover:bg-white/20 text-xs h-7 px-2"
                onClick={() => handleDemoSwitch('teacher')}
                disabled={isSwitching}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Teacher
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              className="text-white hover:bg-white/20 text-xs h-7 px-2"
              onClick={() => handleDemoSwitch('accountant')}
              disabled={isSwitching || isFinanceView}
            >
              <Calculator className="h-3 w-3 mr-1" />
              Accountant
            </Button>
            {portalType !== 'student' && (
              <Button 
                size="sm" 
                variant="ghost"
                className="text-white hover:bg-white/20 text-xs h-7 px-2"
                onClick={() => handleDemoSwitch('student')}
                disabled={isSwitching}
              >
                <GraduationCap className="h-3 w-3 mr-1" />
                Student
              </Button>
            )}
            {portalType !== 'parent' && (
              <Button 
                size="sm" 
                variant="ghost"
                className="text-white hover:bg-white/20 text-xs h-7 px-2"
                onClick={() => handleDemoSwitch('parent')}
                disabled={isSwitching}
              >
                <Users className="h-3 w-3 mr-1" />
                Parent
              </Button>
            )}
          </div>

          {/* Mobile View Switcher Dropdown */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 h-7 px-2"
                  disabled={isSwitching}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDemoSwitch('admin')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
                {!isFinanceView && (
                  <DropdownMenuItem onClick={() => handleDemoSwitch('teacher')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Teacher View
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDemoSwitch('accountant')} disabled={isFinanceView}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Accountant View
                </DropdownMenuItem>
                {portalType !== 'student' && (
                  <DropdownMenuItem onClick={() => handleDemoSwitch('student')}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Student View
                  </DropdownMenuItem>
                )}
                {portalType !== 'parent' && (
                  <DropdownMenuItem onClick={() => handleDemoSwitch('parent')}>
                    <Users className="h-4 w-4 mr-2" />
                    Parent View
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleStartFreeTrial}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Start Free Trial</span>
            <span className="sm:hidden">Sign Up</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
