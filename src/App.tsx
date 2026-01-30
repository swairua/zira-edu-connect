import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Landing from "@/pages/Landing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { StudentAuthProvider } from "@/contexts/StudentAuthContext";
import { ParentAuthProvider } from "@/contexts/ParentAuthContext";
import { InstitutionProvider } from "@/contexts/InstitutionContext";
import { GroupProvider } from "@/contexts/GroupContext";
import { PWAUpdatePrompt } from "@/components/shared/PWAUpdatePrompt";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ParentRoute } from "@/components/auth/ParentRoute";
import { GroupRoute } from "@/components/auth/GroupRoute";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";
import Index from "./pages/Index";
import Institutions from "./pages/Institutions";
import AddInstitution from "./pages/AddInstitution";
import InstitutionModules from "./pages/institutions/InstitutionModules";
import Subscriptions from "./pages/Subscriptions";
import AuditLogs from "./pages/AuditLogs";
import Billing from "./pages/Billing";
import SystemHealth from "./pages/SystemHealth";
import Finance from "./pages/Finance";
import CountrySettings from "./pages/CountrySettings";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import FeeStructure from "./pages/FeeStructure";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Payments from "./pages/Payments";
import AcademicSetup from "./pages/AcademicSetup";
import AcademicsDashboard from "./pages/AcademicsDashboard";
import ClassSetup from "./pages/ClassSetup";
import SubjectSetup from "./pages/SubjectSetup";
import Staff from "./pages/Staff";
import Parents from "./pages/Parents";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import ScoreEntry from "./pages/ScoreEntry";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import AcademicSettings from "./pages/academics/AcademicSettings";
import HostelSettings from "./pages/hostel/HostelSettings";
import InventorySettings from "./pages/inventory/InventorySettings";
import CafeteriaSettings from "./pages/cafeteria/CafeteriaSettings";
import AdmissionNumberSettings from "./pages/settings/AdmissionNumberSettings";
import BackupSettings from "./pages/settings/BackupSettings";
import Messaging from "./pages/Messaging";
import SmsSettings from "./pages/SmsSettings";
import SupportTickets from "./pages/SupportTickets";
import TicketDetail from "./pages/TicketDetail";
import GradeApprovals from "./pages/GradeApprovals";
import ResultReleases from "./pages/ResultReleases";
import GradeHistory from "./pages/GradeHistory";
import LessonPlanApprovals from "./pages/LessonPlanApprovals";
import SchemeApprovals from "./pages/SchemeApprovals";
// Finance Pages
import FinanceDiscounts from "./pages/finance/Discounts";
import FinanceAdjustments from "./pages/finance/Adjustments";
import FinanceReconciliation from "./pages/finance/Reconciliation";
import FinancePeriods from "./pages/finance/Periods";
import MpesaTransactions from "./pages/finance/MpesaTransactions";
import ReminderSchedules from "./pages/finance/ReminderSchedules";
import AppliedPenalties from "./pages/finance/AppliedPenalties";
// Admin Finance Setup Pages
import AdminChartOfAccounts from "./pages/finance/ChartOfAccounts";
import AdminFunds from "./pages/finance/Funds";
import AdminVoteheads from "./pages/finance/Voteheads";
import AdminBankAccounts from "./pages/finance/BankAccounts";
import FinanceSettings from "./pages/finance/FinanceSettings";
// Admin Finance Reports Pages
import AdminTrialBalance from "./pages/reports/TrialBalance";
import AdminGeneralLedger from "./pages/reports/GeneralLedger";
// Reports Pages
import DailyCollection from "./pages/reports/DailyCollection";
import AgingReport from "./pages/reports/AgingReport";
// HR Pages
import HRDashboard from "./pages/hr/HRDashboard";
import LeaveManagement from "./pages/hr/LeaveManagement";
import StaffAttendance from "./pages/hr/StaffAttendance";
import PayrollOverview from "./pages/hr/PayrollOverview";
import StaffSalaries from "./pages/hr/StaffSalaries";
import AllowanceTypes from "./pages/hr/AllowanceTypes";
import DeductionTypes from "./pages/hr/DeductionTypes";
import PayrollRuns from "./pages/hr/PayrollRuns";
import Payslips from "./pages/hr/Payslips";
import PayrollSettings from "./pages/hr/PayrollSettings";
// Communication Pages
import CommunicationDashboard from "./pages/communication/CommunicationDashboard";
import BulkSMS from "./pages/communication/BulkSMS";
import Announcements from "./pages/communication/Announcements";
import SMSHistory from "./pages/communication/SMSHistory";
import MessageTemplates from "./pages/communication/MessageTemplates";
import PushNotifications from "./pages/communication/PushNotifications";
// Advanced Reports Pages
import ReportsDashboard from "./pages/advancedreports/ReportsDashboard";
import AdvancedFinancialReports from "./pages/advancedreports/FinancialReports";
import AdvancedAcademicReports from "./pages/advancedreports/AcademicReports";
import DataExport from "./pages/advancedreports/DataExport";
import ReportCards from "./pages/reports/ReportCards";
// Parent Portal Pages
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentFees from "./pages/parent/ParentFees";
import ParentResults from "./pages/parent/ParentResults";
import ParentNotices from "./pages/parent/ParentNotices";
import ParentMessages from "./pages/parent/ParentMessages";
import ParentProfile from "./pages/parent/ParentProfile";
import ParentAssignments from "./pages/parent/ParentAssignments";
import ParentAssignmentDetail from "./pages/parent/ParentAssignmentDetail";
// Student Portal Pages
import { StudentRoute } from "./components/auth/StudentRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentAssignmentDetail from "./pages/student/StudentAssignmentDetail";
import StudentResults from "./pages/student/StudentResults";
import StudentFees from "./pages/student/StudentFees";
import StudentProfilePage from "./pages/student/StudentProfile";
// Staff Portal Pages
import { StaffRoute } from "./components/auth/StaffRoute";
import StaffDashboard from "./pages/portal/StaffDashboard";
import TeacherClasses from "./pages/portal/TeacherClasses";
import TeacherGrades from "./pages/portal/TeacherGrades";
import TeacherAssignments from "./pages/portal/TeacherAssignments";
import TeacherAssignmentGrading from "./pages/portal/TeacherAssignmentGrading";
import TeacherExamGrading from "./pages/portal/TeacherExamGrading";
import TeacherAttendance from "./pages/portal/TeacherAttendance";
import TeacherMessages from "./pages/portal/TeacherMessages";
import StaffProfilePage from "./pages/portal/StaffProfile";
import MyLeave from "./pages/portal/MyLeave";
import FinanceDashboard from "./pages/portal/FinanceDashboard";
import FinanceOverview from "./pages/admin/FinanceOverview";
import LessonPlanning from "./pages/portal/LessonPlanning";
import CBCCurriculum from "./pages/portal/CBCCurriculum";
import QuestionBank from "./pages/portal/QuestionBank";
import ExamPaperBuilder from "./pages/portal/ExamPaperBuilder";
import StudentDiary from "./pages/portal/StudentDiary";
import ParentDiary from "./pages/parent/ParentDiary";
import TimetableGenerator from "./pages/timetable/TimetableGenerator";
// Portal Finance Pages
import PortalPayments from "./pages/portal/finance/PortalPayments";
import PortalInvoices from "./pages/portal/finance/PortalInvoices";
import PortalInvoiceDetail from "./pages/portal/finance/PortalInvoiceDetail";
import PortalReconciliation from "./pages/portal/finance/PortalReconciliation";
import PortalDiscounts from "./pages/portal/finance/PortalDiscounts";
import PortalAdjustments from "./pages/portal/finance/PortalAdjustments";
import PortalPeriods from "./pages/portal/finance/PortalPeriods";
import PortalAgingReport from "./pages/portal/finance/PortalAgingReport";
import PortalDailyReport from "./pages/portal/finance/PortalDailyReport";
import PortalCashbook from "./pages/portal/finance/PortalCashbook";
import PortalVouchers from "./pages/portal/finance/PortalVouchers";
import NewVoucher from "./pages/portal/finance/NewVoucher";
import VoucherDetail from "./pages/portal/finance/VoucherDetail";
import PortalFunds from "./pages/portal/finance/PortalFunds";
import PortalVoteheads from "./pages/portal/finance/PortalVoteheads";
import PortalBankAccounts from "./pages/portal/finance/PortalBankAccounts";
import PortalChartOfAccounts from "./pages/portal/finance/PortalChartOfAccounts";
import PortalTrialBalance from "./pages/portal/finance/PortalTrialBalance";
import PortalGeneralLedger from "./pages/portal/finance/PortalGeneralLedger";
import PortalCapitation from "./pages/portal/finance/PortalCapitation";
import PortalReceipts from "./pages/portal/finance/PortalReceipts";
// Onboarding
import Onboarding from "./pages/Onboarding";
// Group Pages
import GroupDashboard from "./pages/group/GroupDashboard";
import GroupCampuses from "./pages/group/GroupCampuses";
import GroupSettings from "./pages/group/GroupSettings";
import GroupReports from "./pages/group/GroupReports";
import GroupUsers from "./pages/group/GroupUsers";
// Platform Pages
import BankIntegrations from "./pages/platform/BankIntegrations";
import IPNGatewayMonitor from "./pages/platform/IPNGatewayMonitor";
import IntegrationHealth from "./pages/platform/IntegrationHealth";
import ModuleCatalog from "./pages/platform/ModuleCatalog";
// Hostel Pages
import HostelDashboard from "./pages/hostel/HostelDashboard";
import HostelList from "./pages/hostel/HostelList";
import HostelDetail from "./pages/hostel/HostelDetail";
import BedAllocations from "./pages/hostel/BedAllocations";
import AssignStudent from "./pages/hostel/AssignStudent";
import BoardingCharges from "./pages/hostel/BoardingCharges";
// Transport Pages
import TransportDashboard from "./pages/transport/TransportDashboard";
import TransportRoutes from "./pages/transport/TransportRoutes";
import TransportVehicles from "./pages/transport/TransportVehicles";
import TransportDrivers from "./pages/transport/TransportDrivers";
import TransportSubscriptions from "./pages/transport/TransportSubscriptions";
import SubscribeStudent from "./pages/transport/SubscribeStudent";
import TransportApprovals from "./pages/transport/TransportApprovals";
import TransportPolicySettings from "./pages/transport/TransportPolicySettings";
// Parent Transport
import ParentTransport from "./pages/parent/ParentTransport";
// Library Pages
import LibraryDashboard from "./pages/library/LibraryDashboard";
import BookCatalog from "./pages/library/BookCatalog";
import ActiveLoans from "./pages/library/ActiveLoans";
import CheckoutBook from "./pages/library/CheckoutBook";
import ReturnBook from "./pages/library/ReturnBook";
import LibrarySettingsPage from "./pages/library/LibrarySettings";
import TeacherAllocations from "./pages/library/TeacherAllocations";
import TeacherLibrary from "./pages/portal/TeacherLibrary";
import TeacherDistributeBooks from "./pages/portal/TeacherDistributeBooks";
import StudentLibrary from "./pages/student/StudentLibrary";
import ParentLibrary from "./pages/parent/ParentLibrary";
// Activities Pages
import ActivitiesDashboard from "./pages/activities/ActivitiesDashboard";
import ActivitiesList from "./pages/activities/ActivitiesList";
import CreateActivity from "./pages/activities/CreateActivity";
import ManageEnrollments from "./pages/activities/ManageEnrollments";
import ActivityAttendance from "./pages/activities/ActivityAttendance";
import ActivityEvents from "./pages/activities/ActivityEvents";
import ActivityReports from "./pages/activities/ActivityReports";
// Uniforms Pages
import UniformDashboard from "./pages/uniforms/UniformDashboard";
import UniformCatalog from "./pages/uniforms/UniformCatalog";
import UniformOrders from "./pages/uniforms/UniformOrders";
import StockManagement from "./pages/uniforms/StockManagement";
// Parent Uniforms Pages
import ParentUniformStore from "./pages/parent/ParentUniformStore";
import ParentUniformCart from "./pages/parent/ParentUniformCart";
import ParentUniformOrders from "./pages/parent/ParentUniformOrders";
// Timetable Pages
import TimetableDashboard from "./pages/timetable/TimetableDashboard";
import TimetableList from "./pages/timetable/TimetableList";
import CreateTimetable from "./pages/timetable/CreateTimetable";
import TimetableEditor from "./pages/timetable/TimetableEditor";
import RoomManagement from "./pages/timetable/RoomManagement";
import PeriodSetup from "./pages/timetable/PeriodSetup";
import MasterTimetableView from "./pages/timetable/MasterTimetableView";
import TeacherScheduleView from "./pages/timetable/TeacherScheduleView";
import RoomScheduleView from "./pages/timetable/RoomScheduleView";
import TimetableViewer from "./pages/timetable/TimetableViewer";
// Portal Timetable Pages
import WeekBlockTimetableView from "./pages/timetable/WeekBlockTimetableView";
import TeacherTimetable from "./pages/portal/TeacherTimetable";
import ParentTimetable from "./pages/parent/ParentTimetable";
import StudentTimetable from "./pages/student/StudentTimetable";
// Demo Requests
import DemoRequests from "./pages/DemoRequests";
// Company Profile
import CompanyProfile from "./pages/CompanyProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute - data considered fresh
      gcTime: 1000 * 60 * 5, // 5 minutes - cache garbage collection
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 1, // Only retry once on failure
    },
  },
});

function App() {
  usePushNotifications();

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <ParentAuthProvider>
          <InstitutionProvider>
            <Toaster />
            <Sonner />
            <PWAUpdatePrompt />
            <BrowserRouter>
              <GroupProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/institutions"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Institutions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/institutions/new"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <AddInstitution />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/institutions/:id/modules"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <InstitutionModules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/demo-requests"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <DemoRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/new"
                element={
                  <ProtectedRoute permission={{ domain: "students", action: "create" }} requiresInstitution>
                    <AddStudent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/:id"
                element={
                  <ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <FeeStructure />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices/:id"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <InvoiceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academics"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <AcademicsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academic-setup"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "view" }} requiresInstitution>
                    <AcademicSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classes"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "view" }} requiresInstitution>
                    <ClassSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <SubjectSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parents"
                element={
                  <ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution>
                    <Parents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <Attendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <Exams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/:examId/scores"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "edit" }} requiresInstitution>
                    <ScoreEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grade-approvals"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "approve" }} requiresInstitution>
                    <GradeApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result-releases"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "approve" }} requiresInstitution>
                    <ResultReleases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grade-history"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "approve" }} requiresInstitution>
                    <GradeHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lesson-plan-approvals"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "approve" }} requiresInstitution>
                    <LessonPlanApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scheme-approvals"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "approve" }} requiresInstitution>
                    <SchemeApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "view" }}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/backups"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "view" }} requiresInstitution>
                    <BackupSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "view" }}>
                    <Security />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messaging"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "view" }}>
                    <Messaging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sms-settings"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <SmsSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-health"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <SystemHealth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Finance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance-overview"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <FinanceOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/discounts"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <FinanceDiscounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/adjustments"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "approve" }} requiresInstitution>
                    <FinanceAdjustments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/reconciliation"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <FinanceReconciliation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/periods"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "approve" }} requiresInstitution>
                    <FinancePeriods />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/mpesa"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <MpesaTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/reminders"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <ReminderSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/penalties"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AppliedPenalties />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Finance Setup Routes */}
              <Route
                path="/finance/chart-of-accounts"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminChartOfAccounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/funds"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminFunds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/voteheads"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminVoteheads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/bank-accounts"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminBankAccounts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Finance Reports Routes */}
              <Route
                path="/reports/trial-balance"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminTrialBalance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/general-ledger"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AdminGeneralLedger />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/settings"
                element={
                  <ProtectedRoute permission={{ domain: "system_settings", action: "edit" }} requiresInstitution>
                    <FinanceSettings />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports/daily-collection"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <DailyCollection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/aging"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <AgingReport />
                  </ProtectedRoute>
                }
              />
              
              {/* HR Management Routes */}
              <Route
                path="/hr"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <HRDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/leave"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <LeaveManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/attendance"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <StaffAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <PayrollOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/salaries"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "edit" }} requiresInstitution>
                    <StaffSalaries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/allowances"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "edit" }} requiresInstitution>
                    <AllowanceTypes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/deductions"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "edit" }} requiresInstitution>
                    <DeductionTypes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/runs"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "edit" }} requiresInstitution>
                    <PayrollRuns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/payslips"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "view" }} requiresInstitution>
                    <Payslips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll/settings"
                element={
                  <ProtectedRoute permission={{ domain: "staff_hr", action: "edit" }} requiresInstitution>
                    <PayrollSettings />
                  </ProtectedRoute>
                }
              />

              {/* Communication Routes */}
              <Route
                path="/communication"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "view" }} requiresInstitution>
                    <CommunicationDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication/bulk-sms"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "create" }} requiresInstitution>
                    <BulkSMS />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication/announcements"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "view" }} requiresInstitution>
                    <Announcements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication/reminders"
                element={
                  <ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution>
                    <ReminderSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication/history"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "view" }} requiresInstitution>
                    <SMSHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication/templates"
                element={
                  <ProtectedRoute permission={{ domain: "communication", action: "edit" }} requiresInstitution>
                    <MessageTemplates />
                  </ProtectedRoute>
                }
              />

              {/* Advanced Reports Routes */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute permission={{ domain: "reports", action: "view" }} requiresInstitution>
                    <ReportsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/financial"
                element={
                  <ProtectedRoute permission={{ domain: "reports", action: "view" }} requiresInstitution>
                    <AdvancedFinancialReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/academic"
                element={
                  <ProtectedRoute permission={{ domain: "reports", action: "view" }} requiresInstitution>
                    <AdvancedAcademicReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/export"
                element={
                  <ProtectedRoute permission={{ domain: "reports", action: "export" }} requiresInstitution>
                    <DataExport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/report-cards"
                element={
                  <ProtectedRoute permission={{ domain: "academics", action: "view" }} requiresInstitution>
                    <ReportCards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/countries"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <CountrySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform/modules"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <ModuleCatalog />
                  </ProtectedRoute>
                }
              />
              <Route path="/install" element={<Install />} />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <SupportTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute>
                    <TicketDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              
              {/* Parent Portal Routes */}
              <Route path="/parent" element={<ParentRoute><ParentDashboard /></ParentRoute>} />
              <Route path="/parent/children" element={<ParentRoute><ParentChildren /></ParentRoute>} />
              <Route path="/parent/fees" element={<ParentRoute><ParentFees /></ParentRoute>} />
              <Route path="/parent/results" element={<ParentRoute><ParentResults /></ParentRoute>} />
              <Route path="/parent/notices" element={<ParentRoute><ParentNotices /></ParentRoute>} />
              <Route path="/parent/messages" element={<ParentRoute><ParentMessages /></ParentRoute>} />
              <Route path="/parent/timetable" element={<ParentRoute><ParentTimetable /></ParentRoute>} />
              <Route path="/parent/profile" element={<ParentRoute><ParentProfile /></ParentRoute>} />
              <Route path="/parent/assignments" element={<ParentRoute><ParentAssignments /></ParentRoute>} />
              <Route path="/parent/assignments/:id" element={<ParentRoute><ParentAssignmentDetail /></ParentRoute>} />
              <Route path="/parent/uniforms" element={<ParentRoute><ParentUniformStore /></ParentRoute>} />
              <Route path="/parent/uniforms/cart" element={<ParentRoute><ParentUniformCart /></ParentRoute>} />
              <Route path="/parent/uniforms/orders" element={<ParentRoute><ParentUniformOrders /></ParentRoute>} />

              {/* Student Portal Routes */}
              <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
              <Route path="/student/assignments" element={<StudentRoute><StudentAssignments /></StudentRoute>} />
              <Route path="/student/assignments/:id" element={<StudentRoute><StudentAssignmentDetail /></StudentRoute>} />
              <Route path="/student/results" element={<StudentRoute><StudentResults /></StudentRoute>} />
              <Route path="/student/timetable" element={<StudentRoute><StudentTimetable /></StudentRoute>} />
              <Route path="/student/fees" element={<StudentRoute><StudentFees /></StudentRoute>} />
              <Route path="/student/profile" element={<StudentRoute><StudentProfilePage /></StudentRoute>} />

              {/* Staff Portal Routes */}
              <Route path="/portal" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
              <Route path="/portal/classes" element={<StaffRoute><TeacherClasses /></StaffRoute>} />
              <Route path="/portal/attendance" element={<StaffRoute><TeacherAttendance /></StaffRoute>} />
              <Route path="/portal/assignments" element={<StaffRoute><TeacherAssignments /></StaffRoute>} />
              <Route path="/portal/assignments/:id/grade" element={<StaffRoute><TeacherAssignmentGrading /></StaffRoute>} />
              <Route path="/portal/grades" element={<StaffRoute><TeacherGrades /></StaffRoute>} />
              <Route path="/portal/grades/:examId/:subjectId/:classId" element={<StaffRoute><TeacherExamGrading /></StaffRoute>} />
              <Route path="/portal/messages" element={<StaffRoute><TeacherMessages /></StaffRoute>} />
              <Route path="/portal/finance" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><FinanceDashboard /></StaffRoute>} />
              <Route path="/portal/profile" element={<StaffRoute><StaffProfilePage /></StaffRoute>} />
              <Route path="/portal/leave" element={<StaffRoute><MyLeave /></StaffRoute>} />
              <Route path="/portal/lesson-plans" element={<StaffRoute><LessonPlanning /></StaffRoute>} />
              <Route path="/portal/curriculum" element={<StaffRoute><CBCCurriculum /></StaffRoute>} />
              
              {/* Portal Finance Routes - Protected with finance:view permission */}
              <Route path="/portal/payments" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalPayments /></StaffRoute>} />
              <Route path="/portal/invoices" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalInvoices /></StaffRoute>} />
              <Route path="/portal/invoices/:id" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalInvoiceDetail /></StaffRoute>} />
              <Route path="/portal/reconciliation" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalReconciliation /></StaffRoute>} />
              <Route path="/portal/discounts" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalDiscounts /></StaffRoute>} />
              <Route path="/portal/adjustments" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalAdjustments /></StaffRoute>} />
              <Route path="/portal/periods" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalPeriods /></StaffRoute>} />
              <Route path="/portal/aging" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalAgingReport /></StaffRoute>} />
              <Route path="/portal/daily-report" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalDailyReport /></StaffRoute>} />
              <Route path="/portal/cashbook" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalCashbook /></StaffRoute>} />
              <Route path="/portal/vouchers" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalVouchers /></StaffRoute>} />
              <Route path="/portal/vouchers/new" element={<StaffRoute permission={{ domain: "finance", action: "create" }}><NewVoucher /></StaffRoute>} />
              <Route path="/portal/vouchers/:id" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><VoucherDetail /></StaffRoute>} />
              <Route path="/portal/funds" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalFunds /></StaffRoute>} />
              <Route path="/portal/voteheads" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalVoteheads /></StaffRoute>} />
              <Route path="/portal/bank-accounts" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalBankAccounts /></StaffRoute>} />
              <Route path="/portal/chart-of-accounts" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalChartOfAccounts /></StaffRoute>} />
              <Route path="/portal/trial-balance" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalTrialBalance /></StaffRoute>} />
              <Route path="/portal/general-ledger" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalGeneralLedger /></StaffRoute>} />
              <Route path="/portal/capitation" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalCapitation /></StaffRoute>} />
              <Route path="/portal/receipts" element={<StaffRoute permission={{ domain: "finance", action: "view" }}><PortalReceipts /></StaffRoute>} />
              
              {/* Portal Academic Routes - Protected with academics permission */}
              <Route path="/portal/question-bank" element={<StaffRoute permission={{ domain: "academics", action: "view" }}><QuestionBank /></StaffRoute>} />
              <Route path="/portal/exam-papers" element={<StaffRoute permission={{ domain: "academics", action: "view" }}><ExamPaperBuilder /></StaffRoute>} />
              
              {/* Portal Diary Route - Protected with students:edit permission */}
              <Route path="/portal/diary" element={<StaffRoute permission={{ domain: "students", action: "edit" }}><StudentDiary /></StaffRoute>} />
              
              {/* Portal catch-all - redirect unknown portal paths to dashboard */}
              <Route path="/portal/*" element={<StaffRoute><Navigate to="/portal" replace /></StaffRoute>} />
              
              {/* Parent Diary Route */}
              <Route path="/parent/diary" element={<ParentRoute><ParentDiary /></ParentRoute>} />
              
              {/* Timetable Generator Route */}
              <Route path="/timetable/generator" element={<ProtectedRoute permission={{ domain: "timetable", action: "edit" }} requiresInstitution><TimetableGenerator /></ProtectedRoute>} />
              {/* Group Routes */}
              <Route path="/group" element={<ProtectedRoute><GroupRoute><GroupDashboard /></GroupRoute></ProtectedRoute>} />
              <Route path="/group/campuses" element={<ProtectedRoute><GroupRoute><GroupCampuses /></GroupRoute></ProtectedRoute>} />
              <Route path="/group/settings" element={<ProtectedRoute><GroupRoute><GroupSettings /></GroupRoute></ProtectedRoute>} />
              <Route path="/group/reports" element={<ProtectedRoute><GroupRoute><GroupReports /></GroupRoute></ProtectedRoute>} />
              <Route path="/group/users" element={<ProtectedRoute><GroupRoute><GroupUsers /></GroupRoute></ProtectedRoute>} />
              
              {/* Platform Routes (Super Admin) */}
              <Route path="/platform/bank-integrations" element={<ProtectedRoute requireSuperAdmin><BankIntegrations /></ProtectedRoute>} />
              <Route path="/platform/ipn-gateway" element={<ProtectedRoute requireSuperAdmin><IPNGatewayMonitor /></ProtectedRoute>} />
              <Route path="/platform/integration-health" element={<ProtectedRoute requireSuperAdmin><IntegrationHealth /></ProtectedRoute>} />
              
              {/* Hostel & Boarding Routes */}
              <Route path="/hostel" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><HostelDashboard /></ProtectedRoute>} />
              <Route path="/hostel/hostels" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><HostelList /></ProtectedRoute>} />
              <Route path="/hostel/hostels/:id" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><HostelDetail /></ProtectedRoute>} />
              <Route path="/hostel/allocations" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><BedAllocations /></ProtectedRoute>} />
              <Route path="/hostel/assign" element={<ProtectedRoute permission={{ domain: "students", action: "create" }} requiresInstitution><AssignStudent /></ProtectedRoute>} />
              <Route path="/hostel/charges" element={<ProtectedRoute permission={{ domain: "finance", action: "view" }} requiresInstitution><BoardingCharges /></ProtectedRoute>} />
              <Route path="/hostel/settings" element={<ProtectedRoute permission={{ domain: "students", action: "edit" }} requiresInstitution><HostelSettings /></ProtectedRoute>} />
              <Route path="/academics/settings" element={<ProtectedRoute permission={{ domain: "academics", action: "edit" }} requiresInstitution><AcademicSettings /></ProtectedRoute>} />
              <Route path="/inventory/settings" element={<ProtectedRoute permission={{ domain: "system_settings", action: "edit" }} requiresInstitution><InventorySettings /></ProtectedRoute>} />
              <Route path="/cafeteria/settings" element={<ProtectedRoute permission={{ domain: "system_settings", action: "edit" }} requiresInstitution><CafeteriaSettings /></ProtectedRoute>} />
              <Route path="/settings/admission-numbers" element={<ProtectedRoute permission={{ domain: "system_settings", action: "edit" }} requiresInstitution><AdmissionNumberSettings /></ProtectedRoute>} />
              
              {/* Transport Routes */}
              <Route path="/transport" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><TransportDashboard /></ProtectedRoute>} />
              <Route path="/transport/routes" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><TransportRoutes /></ProtectedRoute>} />
              <Route path="/transport/vehicles" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><TransportVehicles /></ProtectedRoute>} />
              <Route path="/transport/drivers" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><TransportDrivers /></ProtectedRoute>} />
              <Route path="/transport/subscriptions" element={<ProtectedRoute permission={{ domain: "students", action: "view" }} requiresInstitution><TransportSubscriptions /></ProtectedRoute>} />
              <Route path="/transport/subscribe" element={<ProtectedRoute permission={{ domain: "students", action: "create" }} requiresInstitution><SubscribeStudent /></ProtectedRoute>} />
              <Route path="/transport/approvals" element={<ProtectedRoute permission={{ domain: "students", action: "edit" }} requiresInstitution><TransportApprovals /></ProtectedRoute>} />
              <Route path="/transport/settings" element={<ProtectedRoute permission={{ domain: "system_settings", action: "edit" }} requiresInstitution><TransportPolicySettings /></ProtectedRoute>} />
              
              {/* Library Routes */}
              <Route path="/library" element={<ProtectedRoute permission={{ domain: "library", action: "view" }} requiresInstitution><LibraryDashboard /></ProtectedRoute>} />
              <Route path="/library/books" element={<ProtectedRoute permission={{ domain: "library", action: "view" }} requiresInstitution><BookCatalog /></ProtectedRoute>} />
              <Route path="/library/loans" element={<ProtectedRoute permission={{ domain: "library", action: "view" }} requiresInstitution><ActiveLoans /></ProtectedRoute>} />
              <Route path="/library/checkout" element={<ProtectedRoute permission={{ domain: "library", action: "create" }} requiresInstitution><CheckoutBook /></ProtectedRoute>} />
              <Route path="/library/returns" element={<ProtectedRoute permission={{ domain: "library", action: "edit" }} requiresInstitution><ReturnBook /></ProtectedRoute>} />
              <Route path="/library/settings" element={<ProtectedRoute permission={{ domain: "library", action: "approve" }} requiresInstitution><LibrarySettingsPage /></ProtectedRoute>} />
              <Route path="/library/allocations" element={<ProtectedRoute permission={{ domain: "library", action: "approve" }} requiresInstitution><TeacherAllocations /></ProtectedRoute>} />
              
              {/* Portal Library Routes */}
              <Route path="/portal/library" element={<StaffRoute><TeacherLibrary /></StaffRoute>} />
              <Route path="/portal/library/distribute" element={<StaffRoute><TeacherDistributeBooks /></StaffRoute>} />
              <Route path="/student/library" element={<StudentRoute><StudentLibrary /></StudentRoute>} />
              <Route path="/parent/library" element={<ParentRoute><ParentLibrary /></ParentRoute>} />
              
              {/* Activities Routes */}
              <Route path="/activities" element={<ProtectedRoute permission={{ domain: "activities", action: "view" }} requiresInstitution><ActivitiesDashboard /></ProtectedRoute>} />
              <Route path="/activities/list" element={<ProtectedRoute permission={{ domain: "activities", action: "view" }} requiresInstitution><ActivitiesList /></ProtectedRoute>} />
              <Route path="/activities/create" element={<ProtectedRoute permission={{ domain: "activities", action: "create" }} requiresInstitution><CreateActivity /></ProtectedRoute>} />
              <Route path="/activities/enrollments" element={<ProtectedRoute permission={{ domain: "activities", action: "view" }} requiresInstitution><ManageEnrollments /></ProtectedRoute>} />
              <Route path="/activities/attendance" element={<ProtectedRoute permission={{ domain: "activities", action: "edit" }} requiresInstitution><ActivityAttendance /></ProtectedRoute>} />
              <Route path="/activities/events" element={<ProtectedRoute permission={{ domain: "activities", action: "view" }} requiresInstitution><ActivityEvents /></ProtectedRoute>} />
              <Route path="/activities/reports" element={<ProtectedRoute permission={{ domain: "activities", action: "view" }} requiresInstitution><ActivityReports /></ProtectedRoute>} />
              
              {/* Uniforms Routes */}
              <Route path="/uniforms" element={<ProtectedRoute permission={{ domain: "uniforms", action: "view" }} requiresInstitution><UniformDashboard /></ProtectedRoute>} />
              <Route path="/uniforms/catalog" element={<ProtectedRoute permission={{ domain: "uniforms", action: "view" }} requiresInstitution><UniformCatalog /></ProtectedRoute>} />
              <Route path="/uniforms/orders" element={<ProtectedRoute permission={{ domain: "uniforms", action: "view" }} requiresInstitution><UniformOrders /></ProtectedRoute>} />
              <Route path="/uniforms/stock" element={<ProtectedRoute permission={{ domain: "uniforms", action: "view" }} requiresInstitution><StockManagement /></ProtectedRoute>} />
              
              {/* Timetable Routes */}
              <Route path="/timetable" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><TimetableDashboard /></ProtectedRoute>} />
              <Route path="/timetable/manage" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><TimetableList /></ProtectedRoute>} />
              <Route path="/timetable/create" element={<ProtectedRoute permission={{ domain: "timetable", action: "create" }} requiresInstitution><CreateTimetable /></ProtectedRoute>} />
              <Route path="/timetable/view" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><MasterTimetableView /></ProtectedRoute>} />
              <Route path="/timetable/week-block" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><WeekBlockTimetableView /></ProtectedRoute>} />
              <Route path="/timetable/teachers" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><TeacherScheduleView /></ProtectedRoute>} />
              <Route path="/timetable/room-schedule" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><RoomScheduleView /></ProtectedRoute>} />
              <Route path="/timetable/:id" element={<ProtectedRoute permission={{ domain: "timetable", action: "edit" }} requiresInstitution><TimetableEditor /></ProtectedRoute>} />
              <Route path="/timetable/:id/view" element={<ProtectedRoute permission={{ domain: "timetable", action: "view" }} requiresInstitution><TimetableViewer /></ProtectedRoute>} />
              <Route path="/timetable/rooms" element={<ProtectedRoute permission={{ domain: "timetable", action: "edit" }} requiresInstitution><RoomManagement /></ProtectedRoute>} />
              <Route path="/timetable/periods" element={<ProtectedRoute permission={{ domain: "timetable", action: "edit" }} requiresInstitution><PeriodSetup /></ProtectedRoute>} />
              
              {/* Portal Timetable Routes */}
              <Route path="/portal/timetable" element={<StaffRoute><TeacherTimetable /></StaffRoute>} />
              <Route path="/parent/timetable" element={<ParentRoute><ParentTimetable /></ParentRoute>} />
              <Route path="/student/timetable" element={<StudentRoute><StudentTimetable /></StudentRoute>} />
              
              {/* Parent Transport Route */}
              <Route path="/parent/transport" element={<ParentRoute><ParentTransport /></ParentRoute>} />
              
              <Route path="*" element={<NotFound />} />
              </Routes>
              </GroupProvider>
            </BrowserRouter>
        </InstitutionProvider>
          </ParentAuthProvider>
      </StudentAuthProvider>
    </AuthProvider>
  </TooltipProvider>
</QueryClientProvider>
  );
}

export default App;
