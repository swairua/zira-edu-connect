import { useState, useEffect, useRef } from 'react';
import authHeroImage from '@/assets/auth-hero.jpg';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, Play, Sparkles, Calendar } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Link } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(1, 'This field is required');
const phoneSchema = z.string().min(9, 'Please enter a valid phone number');
const otpSchema = z.string().length(6, 'OTP must be 6 digits');

interface OtpEntity {
  id: string;
  name: string;
  admissionNumber?: string;
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupErrors, setSignupErrors] = useState<{ 
    email?: string; 
    password?: string; 
    firstName?: string; 
    lastName?: string;
  }>({});

  // Student OTP login
  const [studentPhone, setStudentPhone] = useState('');
  const [studentOtp, setStudentOtp] = useState('');
  const [studentOtpSent, setStudentOtpSent] = useState(false);
  const [studentEntities, setStudentEntities] = useState<OtpEntity[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentErrors, setStudentErrors] = useState<{ phone?: string; otp?: string }>({});
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [isDemoOtp, setIsDemoOtp] = useState(false);

  // Parent login
  const [parentLoginMethod, setParentLoginMethod] = useState<'email' | 'otp'>('otp');
  const [parentPhone, setParentPhone] = useState('');
  const [parentOtp, setParentOtp] = useState('');
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentErrors, setParentErrors] = useState<{ phone?: string; otp?: string; email?: string; password?: string }>({});

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const { signIn, signUp, signOut, user, isSuperAdmin, isSupportAdmin, hasRole, rolesLoading } = useAuth();
  const { loginWithOtp, loginDemo: loginDemoStudent, isAuthenticated: isStudentAuthenticated } = useStudentAuth();
  const { startDemoSession } = useDemoMode();
  const queryClient = useQueryClient();
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [isStartingDemoPortal, setIsStartingDemoPortal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const demoTriggeredRef = useRef(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  const initialTab = (location.state as { tab?: string })?.tab;
  const demoType = searchParams.get('demo');

  useEffect(() => {
    if (demoType) {
      // Set the appropriate tab based on demo type
      if (demoType === 'student') {
        setActiveTab('student');
      } else if (demoType === 'parent') {
        setActiveTab('parent');
      } else {
        setActiveTab('login');
      }
    } else if (initialTab === 'student') {
      setActiveTab('student');
    } else if (initialTab === 'parent') {
      setActiveTab('parent');
    } else if (initialTab === 'signup') {
      setActiveTab('signup');
    } else if (initialTab === 'login') {
      setActiveTab('login');
    }
  }, [initialTab, demoType]);

  // Auto-trigger demo when coming from landing page portal links
  useEffect(() => {
    if (demoType && !demoTriggeredRef.current && !isStartingDemo && !isStartingDemoPortal) {
      demoTriggeredRef.current = true;
      
      // Small delay to let UI render before triggering demo
      const timer = setTimeout(() => {
        switch (demoType) {
          case 'student':
            handleDemoStudentAccess();
            break;
          case 'parent':
            handleDemoParentAccess();
            break;
          case 'teacher':
          case 'admin':
            handleTryDemo();
            break;
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [demoType, isStartingDemo, isStartingDemoPortal]);

  useEffect(() => {
    if (isStudentAuthenticated) {
      navigate('/student', { replace: true });
      return;
    }
    
    // Wait for roles to load before redirecting
    if (rolesLoading) return;
    
    // DON'T redirect if demo mode is requested - let demo handler manage the session
    if (demoType) return;
    
    // Only proceed with redirects if user is authenticated and roles are confirmed
    if (user && !rolesLoading) {
      // Student role (not OTP based)
      if (hasRole('student') && !isSuperAdmin && !isSupportAdmin) {
        navigate('/student', { replace: true });
        return;
      }
      // Parent role (without admin/staff roles)
      if (hasRole('parent') && !isSuperAdmin && !isSupportAdmin && 
          !hasRole('institution_admin') && !hasRole('institution_owner')) {
        navigate('/parent', { replace: true });
        return;
      }
      // Super/Support admins go to main dashboard
      if (isSuperAdmin || isSupportAdmin) {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Institution admin/owner go to main dashboard (higher priority than staff roles)
      if (hasRole('institution_admin') || hasRole('institution_owner')) {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Staff-ONLY roles go to portal (users who have staff roles but NOT admin roles)
      const staffPortalRoles = ['teacher', 'finance_officer', 'accountant', 'hr_manager', 'academic_director', 'ict_admin', 'bursar', 'librarian', 'coach'];
      const hasStaffRole = staffPortalRoles.some(role => hasRole(role as any));
      const hasAdminRole = hasRole('institution_admin') || hasRole('institution_owner');
      
      if (hasStaffRole && !hasAdminRole) {
        navigate('/portal', { replace: true });
        return;
      }
      // Default fallback
      navigate(from, { replace: true });
    }
  }, [user, isStudentAuthenticated, isSuperAdmin, isSupportAdmin, hasRole, rolesLoading, navigate, from, demoType]);

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiresIn > 0) {
      const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiresIn]);

  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(loginEmail);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(loginPassword);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const errors: { email?: string; password?: string; firstName?: string; lastName?: string } = {};
    
    const emailResult = emailSchema.safeParse(signupEmail);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(signupPassword);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    const firstNameResult = nameSchema.safeParse(signupFirstName);
    if (!firstNameResult.success) {
      errors.firstName = firstNameResult.error.errors[0].message;
    }
    
    const lastNameResult = nameSchema.safeParse(signupLastName);
    if (!lastNameResult.success) {
      errors.lastName = lastNameResult.error.errors[0].message;
    }
    
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    
    const { error } = await signUp(signupEmail, signupPassword, signupFirstName, signupLastName);
    
    if (error) {
      let errorMessage = error.message;
      
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: errorMessage,
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Welcome to Zira EduSuite. You are now logged in.',
      });
    }
    
    setIsLoading(false);
  };

  const handleRequestStudentOtp = async () => {
    const phoneResult = phoneSchema.safeParse(studentPhone);
    if (!phoneResult.success) {
      setStudentErrors({ phone: phoneResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    setStudentErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { phone: studentPhone, userType: 'student' },
      });

      if (error) throw new Error('Failed to send OTP');
      if (!data?.success) throw new Error(data?.error || 'Failed to send OTP');

      setStudentOtpSent(true);
      setStudentEntities(data.entities || []);
      setOtpExpiresIn(data.expiresIn || 300);
      setIsDemoOtp(data.isDemo === true);
      
      if (data.entities?.length === 1) {
        setSelectedStudentId(data.entities[0].id);
      }

      // For demo mode, auto-fill the OTP
      if (data.isDemo && data.demoOtp) {
        setStudentOtp(data.demoOtp);
        toast({
          title: 'Demo Mode',
          description: `OTP auto-filled: ${data.demoOtp}`,
        });
      } else {
        toast({
          title: 'OTP Sent',
          description: `A 6-digit code has been sent to ${data.maskedPhone}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send OTP',
      });
    }

    setIsLoading(false);
  };

  const handleVerifyStudentOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpResult = otpSchema.safeParse(studentOtp);
    if (!otpResult.success) {
      setStudentErrors({ otp: otpResult.error.errors[0].message });
      return;
    }

    if (studentEntities.length > 1 && !selectedStudentId) {
      toast({
        variant: 'destructive',
        title: 'Select a student',
        description: 'Please select which student you want to log in as.',
      });
      return;
    }

    setIsLoading(true);
    setStudentErrors({});

    try {
      await loginWithOtp(studentPhone, studentOtp, selectedStudentId || undefined);
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
      navigate('/student', { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid OTP',
      });
    }

    setIsLoading(false);
  };

  const handleRequestParentOtp = async () => {
    const phoneResult = phoneSchema.safeParse(parentPhone);
    if (!phoneResult.success) {
      setParentErrors({ phone: phoneResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    setParentErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { phone: parentPhone, userType: 'parent' },
      });

      if (error) throw new Error('Failed to send OTP');
      if (!data?.success) throw new Error(data?.error || 'Failed to send OTP');

      setParentOtpSent(true);
      setOtpExpiresIn(data.expiresIn || 300);
      setIsDemoOtp(data.isDemo === true);

      // For demo mode, auto-fill the OTP
      if (data.isDemo && data.demoOtp) {
        setParentOtp(data.demoOtp);
        toast({
          title: 'Demo Mode',
          description: `OTP auto-filled: ${data.demoOtp}`,
        });
      } else {
        toast({
          title: 'OTP Sent',
          description: `A 6-digit code has been sent to ${data.maskedPhone}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send OTP',
      });
    }

    setIsLoading(false);
  };

  const handleVerifyParentOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpResult = otpSchema.safeParse(parentOtp);
    if (!otpResult.success) {
      setParentErrors({ otp: otpResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    setParentErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: parentPhone, code: parentOtp, userType: 'parent' },
      });

      if (error) throw new Error('Verification failed');
      if (!data?.success) throw new Error(data?.error || 'Invalid OTP');

      // Store parent session
      localStorage.setItem('parent_session_token', data.token);
      localStorage.setItem('parent_session_expiry', data.expiresAt);
      localStorage.setItem('parent_session_data', JSON.stringify({
        parent: data.user,
        institution: data.institution,
      }));

      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
      
      // Force reload to pick up the new session
      window.location.href = '/parent';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid OTP',
      });
    }

    setIsLoading(false);
  };

  const handleParentEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(parentEmail);
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    const passwordResult = passwordSchema.safeParse(parentPassword);
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    setParentErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    const { error } = await signIn(parentEmail, parentPassword);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password.'
          : error.message,
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    }

    setIsLoading(false);
  };

  const resetStudentOtp = () => {
    setStudentOtpSent(false);
    setStudentOtp('');
    setStudentEntities([]);
    setSelectedStudentId(null);
    setOtpExpiresIn(0);
    setIsDemoOtp(false);
  };

  const clearAllSessions = async () => {
    try {
      // Force sign out from Supabase first (handles stale tokens)
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // Ignore signOut errors - session might already be invalid
      console.log('Session already cleared or invalid');
    }
    
    // Also call context signOut for cleanup
    try {
      await signOut();
    } catch (e) {
      // Ignore errors
    }
    
    // Clear all local storage tokens including Supabase auth token
    localStorage.removeItem('sb-mpbqkvseaiolalnniqud-auth-token');
    localStorage.removeItem('student_session_token');
    localStorage.removeItem('student_session_expiry');
    localStorage.removeItem('parent_session_token');
    localStorage.removeItem('parent_session_expiry');
    localStorage.removeItem('parent_session_data');
    localStorage.removeItem('parent_session_verified');
    
    // Clear React Query cache
    queryClient.clear();
    
    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const handleTryDemo = async () => {
    setIsStartingDemo(true);
    try {
      // Clear any existing sessions first
      await clearAllSessions();
      
      // Retry logic for edge function
      let result;
      let retries = 2;
      while (retries > 0) {
        try {
          result = await startDemoSession.mutateAsync();
          break;
        } catch (e) {
          retries--;
          if (retries === 0) throw e;
          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Sign in with demo credentials
      const { error } = await signIn('demo@zira.tech', 'DemoAccess2024!');
      
      if (error) {
        // Demo user might not exist, try a different approach
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Demo Setup',
            description: 'Setting up demo account. Please try again in a moment.',
          });
          // Force page reload to clear stale state
          window.location.href = '/auth';
          return;
        }
        toast({
          variant: 'destructive',
          title: 'Login Error',
          description: error.message,
        });
      } else {
        // Invalidate all queries to force fresh data fetch
        queryClient.invalidateQueries();
        
        toast({
          title: 'Welcome to Demo!',
          description: `Explore with ${result?.stats?.students || 150}+ students and full data.`,
        });
        
        // Use window.location for clean navigation after auth change
        window.location.href = '/dashboard';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start demo';
      
      // Check for specific error conditions
      if (errorMessage.includes('already exists') || errorMessage.includes('Demo institution')) {
        // Demo already exists, try login directly
        const { error: loginError } = await signIn('demo@zira.tech', 'DemoAccess2024!');
        if (!loginError) {
          queryClient.invalidateQueries();
          window.location.href = '/dashboard';
          return;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Demo Error',
        description: errorMessage,
      });
    } finally {
      setIsStartingDemo(false);
    }
  };

  const resetParentOtp = () => {
    setParentOtpSent(false);
    setParentOtp('');
    setOtpExpiresIn(0);
    setIsDemoOtp(false);
  };

  // One-click demo student access
  const handleDemoStudentAccess = async () => {
    setIsStartingDemoPortal(true);
    try {
      // Clear any existing sessions first
      await clearAllSessions();
      
      await loginDemoStudent();
      toast({
        title: 'Welcome to Demo!',
        description: 'Exploring the student portal with sample data.',
      });
      navigate('/student', { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Demo Unavailable',
        description: error instanceof Error ? error.message : 'Could not start demo',
      });
    } finally {
      setIsStartingDemoPortal(false);
    }
  };

  // One-click demo parent access
  const handleDemoParentAccess = async () => {
    setIsStartingDemoPortal(true);
    try {
      // Clear any existing sessions first
      await clearAllSessions();
      
      const { data, error } = await supabase.functions.invoke('demo-portal-access', {
        body: { userType: 'parent' },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Demo not available');
      }

      // Store parent session
      localStorage.setItem('parent_session_token', data.token);
      localStorage.setItem('parent_session_expiry', data.expiresAt);
      localStorage.setItem('parent_session_data', JSON.stringify({
        parent: data.user,
        institution: data.institution,
        isDemo: data.isDemo ?? true,
      }));
      localStorage.setItem('parent_session_verified', 'true');

      toast({
        title: 'Welcome to Demo!',
        description: 'Exploring the parent portal with sample data.',
      });
      
      window.location.href = '/parent';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Demo Unavailable',
        description: error instanceof Error ? error.message : 'Could not start demo',
      });
    } finally {
      setIsStartingDemoPortal(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img 
          src={authHeroImage}
          alt="African students in modern classroom"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient Overlay - top-heavy for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-landing-blue/90 via-landing-blue/40 to-transparent" />
        
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        {/* Content - positioned at top */}
        <div className="relative z-10 flex flex-col justify-start p-12 pt-16 text-white h-full">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 font-display">
            Welcome to Zira EduSuite
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-sm">
            Streamline your school management with our complete education platform.
          </p>
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span>Comprehensive student management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span>Real-time attendance tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span>Seamless fee management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo and branding (visible on all screens) */}
          <div className="text-center mb-8">
            <div className="inline-flex lg:hidden items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              <span className="lg:hidden">Zira EduSuite</span>
              <span className="hidden lg:inline">Sign In</span>
            </h1>
            <p className="text-muted-foreground mt-1 mb-4">
              <span className="lg:hidden">Education Management Platform</span>
              <span className="hidden lg:inline">Access your dashboard</span>
            </p>
            
            {/* Demo Access Options */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <Button
                variant="outline"
                onClick={handleTryDemo}
                disabled={isStartingDemo}
                className="flex-1 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 text-amber-700"
              >
                {isStartingDemo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Instant Demo
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/?scrollTo=contact')}
                className="flex-1 border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Request Guided Demo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Instant:</span> Explore with sample data | <span className="font-medium">Guided:</span> Get a personalized walkthrough
            </p>
          </div>

          <Card className="shadow-xl border-0 lg:shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {activeTab === 'login' ? 'Staff Login' : 
               activeTab === 'student' ? 'Student Login' : 
               activeTab === 'parent' ? 'Parent Login' :
               'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard'
                : activeTab === 'student'
                ? 'Enter your phone number to receive an OTP'
                : activeTab === 'parent'
                ? 'Sign in to view your children\'s progress'
                : 'Enter your details to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 gap-1 h-auto sm:grid-cols-4 sm:gap-0 sm:h-10 mb-6">
                <TabsTrigger value="login" className="py-2 sm:py-1.5">Staff</TabsTrigger>
                <TabsTrigger value="student" className="py-2 sm:py-1.5">Student</TabsTrigger>
                <TabsTrigger value="parent" className="py-2 sm:py-1.5">Parent</TabsTrigger>
                <TabsTrigger value="signup" className="py-2 sm:py-1.5">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Staff Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`pl-10 ${loginErrors.email ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-sm text-destructive">{loginErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`pl-10 pr-10 ${loginErrors.password ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-destructive">{loginErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Student OTP Login Tab */}
              <TabsContent value="student">
                {/* Quick Demo Access Card */}
                <div className="mb-4 p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Try Demo</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDemoStudentAccess}
                      disabled={isStartingDemoPortal}
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      {isStartingDemoPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="mr-1.5 h-3 w-3" />
                          Access Demo
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant access with sample student data
                  </p>
                </div>

                {!studentOtpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Parent's Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="student-phone"
                          type="tel"
                          placeholder="0722XXXXXX or +254722XXXXXX"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          className={`pl-10 ${studentErrors.phone ? 'border-destructive' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {studentErrors.phone && (
                        <p className="text-sm text-destructive">{studentErrors.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter the phone number registered with your school
                      </p>
                    </div>

                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={handleRequestStudentOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Request OTP'
                      )}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyStudentOtp} className="space-y-4">
                    <button
                      type="button"
                      onClick={resetStudentOtp}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Change phone number
                    </button>

                    {studentEntities.length > 1 && (
                      <div className="space-y-2">
                        <Label>Select Student</Label>
                        <div className="space-y-2">
                          {studentEntities.map((entity) => (
                            <label
                              key={entity.id}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedStudentId === entity.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="student"
                                value={entity.id}
                                checked={selectedStudentId === entity.id}
                                onChange={() => setSelectedStudentId(entity.id)}
                                className="sr-only"
                              />
                              <div>
                                <p className="font-medium">{entity.name}</p>
                                {entity.admissionNumber && (
                                  <p className="text-sm text-muted-foreground">
                                    {entity.admissionNumber}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Enter 6-digit OTP</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={studentOtp}
                          onChange={setStudentOtp}
                          disabled={isLoading}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {studentErrors.otp && (
                        <p className="text-sm text-destructive text-center">{studentErrors.otp}</p>
                      )}
                      {otpExpiresIn > 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                          OTP expires in {Math.floor(otpExpiresIn / 60)}:{(otpExpiresIn % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleRequestStudentOtp}
                      disabled={isLoading || otpExpiresIn > 240}
                    >
                      Resend OTP
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* Parent Login Tab */}
              <TabsContent value="parent">
                {/* Quick Demo Access Card */}
                <div className="mb-4 p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Try Demo</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDemoParentAccess}
                      disabled={isStartingDemoPortal}
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      {isStartingDemoPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="mr-1.5 h-3 w-3" />
                          Access Demo
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant access to view sample children's data
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Toggle between Email and OTP */}
                  <div className="flex rounded-lg bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setParentLoginMethod('otp')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        parentLoginMethod === 'otp'
                          ? 'bg-background shadow-sm'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Phone OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentLoginMethod('email')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        parentLoginMethod === 'email'
                          ? 'bg-background shadow-sm'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Email Login
                    </button>
                  </div>

                  {parentLoginMethod === 'otp' ? (
                    !parentOtpSent ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent-phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="parent-phone"
                              type="tel"
                              placeholder="0722XXXXXX or +254722XXXXXX"
                              value={parentPhone}
                              onChange={(e) => setParentPhone(e.target.value)}
                              className={`pl-10 ${parentErrors.phone ? 'border-destructive' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {parentErrors.phone && (
                            <p className="text-sm text-destructive">{parentErrors.phone}</p>
                          )}
                        </div>

                        <Button 
                          type="button" 
                          className="w-full" 
                          onClick={handleRequestParentOtp}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            'Request OTP'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleVerifyParentOtp} className="space-y-4">
                        <button
                          type="button"
                          onClick={resetParentOtp}
                          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Change phone number
                        </button>

                        <div className="space-y-2">
                          <Label>Enter 6-digit OTP</Label>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={parentOtp}
                              onChange={setParentOtp}
                              disabled={isLoading}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          {parentErrors.otp && (
                            <p className="text-sm text-destructive text-center">{parentErrors.otp}</p>
                          )}
                          {otpExpiresIn > 0 && (
                            <p className="text-sm text-muted-foreground text-center">
                              OTP expires in {Math.floor(otpExpiresIn / 60)}:{(otpExpiresIn % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={handleRequestParentOtp}
                          disabled={isLoading || otpExpiresIn > 240}
                        >
                          Resend OTP
                        </Button>
                      </form>
                    )
                  ) : (
                    <form onSubmit={handleParentEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="parent-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="parent-email"
                            type="email"
                            placeholder="name@example.com"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            className={`pl-10 ${parentErrors.email ? 'border-destructive' : ''}`}
                            disabled={isLoading}
                          />
                        </div>
                        {parentErrors.email && (
                          <p className="text-sm text-destructive">{parentErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="parent-password"
                            type={showParentPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={parentPassword}
                            onChange={(e) => setParentPassword(e.target.value)}
                            className={`pl-10 pr-10 ${parentErrors.password ? 'border-destructive' : ''}`}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowParentPassword(!showParentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showParentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {parentErrors.password && (
                          <p className="text-sm text-destructive">{parentErrors.password}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>

                      <div className="text-center">
                        <Link 
                          to="/forgot-password" 
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </form>
                  )}
                </div>
              </TabsContent>
              
              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="John"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          className={`pl-10 ${signupErrors.firstName ? 'border-destructive' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {signupErrors.firstName && (
                        <p className="text-sm text-destructive">{signupErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={signupLastName}
                        onChange={(e) => setSignupLastName(e.target.value)}
                        className={signupErrors.lastName ? 'border-destructive' : ''}
                        disabled={isLoading}
                      />
                      {signupErrors.lastName && (
                        <p className="text-sm text-destructive">{signupErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={`pl-10 ${signupErrors.email ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-sm text-destructive">{signupErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`pl-10 pr-10 ${signupErrors.password ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-destructive">{signupErrors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} Zira EduSuite
          </p>
        </div>
      </div>
    </div>
  );
}
