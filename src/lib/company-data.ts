// Zira Technologies Company Profile Data
// Centralized data for company profile page and PDF generation

import { 
  GraduationCap, 
  Home, 
  Lock, 
  MessageSquare, 
  Share2, 
  ShoppingCart,
  Users,
  CreditCard,
  BookOpen,
  Bell,
  ClipboardList,
  Bus,
  Building,
  Library,
  Calendar,
  FileText,
  Shield,
  Zap,
  Globe,
  Headphones,
  Wallet,
  Calculator,
  Receipt,
  TrendingUp,
  UserCheck,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Smartphone,
  Megaphone,
  Send,
  Server,
  Key,
  History,
  UtensilsCrossed,
  Shirt,
  FileEdit,
  HelpCircle,
  BookMarked,
  Sparkles,
  NotebookPen
} from "lucide-react";

export const COMPANY_INFO = {
  name: "Zira Technologies",
  tagline: "Powering African Digital Transformation",
  mission: "Building digital infrastructure for Africa's business revolution through innovative, locally-designed technology platforms.",
  vision: "Transforming African businesses through innovative technology solutions that drive efficiency, growth, and digital inclusion.",
  website: "zira-tech.com",
  email: "info@ziratech.com",
  supportEmail: "support@ziratech.com",
  phone: "+254 757 878 023",
  whatsapp: "+254 757 878 023",
  headquarters: "Venus Complex, Northern Bypass, Nairobi, Kenya",
  country: "Kenya",
  values: [
    { title: "Innovation", description: "Continuously pushing boundaries in technology" },
    { title: "Reliability", description: "99.9% uptime you can depend on" },
    { title: "Local-First", description: "Built specifically for African markets" },
  ],
};

export const PLATFORMS = [
  {
    name: "Zira EduSuite",
    url: "ziraedx.com",
    description: "Complete school management system with M-Pesa integration for fee collection, academic tracking, and parent engagement.",
    stats: "1,000+ schools, 500K+ students",
    icon: GraduationCap,
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "Zira Homes",
    url: "zirahomes.com",
    description: "Property management platform for landlords, agents, and property managers with automated rent collection.",
    stats: "500+ properties managed",
    icon: Home,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Zira Lock",
    url: null,
    description: "PAYGo device financing and remote management solution for electronics retailers and financing companies.",
    stats: "2,500+ devices, 65% default reduction",
    icon: Lock,
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Zira SMS",
    url: null,
    description: "Enterprise bulk messaging platform with high delivery rates and detailed analytics.",
    stats: "2M+ messages/month, 99.2% delivery",
    icon: MessageSquare,
    color: "green",
    gradient: "from-green-500 to-green-600",
  },
  {
    name: "Zira Social",
    url: "zirasocial.com",
    description: "AI-powered social media management tool for scheduling, content creation, and multi-platform publishing.",
    stats: "AI content generation",
    icon: Share2,
    color: "pink",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    name: "Zira Shop",
    url: "zirashop.co.ke",
    description: "AI-powered e-commerce store builder with M-Pesa integration for seamless online selling.",
    stats: "500+ stores, M-Pesa ready",
    icon: ShoppingCart,
    color: "teal",
    gradient: "from-teal-500 to-teal-600",
  },
];

// COMPREHENSIVE EDUSUITE MODULES - CEO-Ready Language
export const EDUSUITE_MODULES = [
  // Core Management - End-to-End Lifecycle
  { category: "Core", icon: Users, title: "Student Management", description: "End-to-end student lifecycle: enrollment, promotions, transfers, alumni tracking", highlight: true },
  { category: "Core", icon: BookOpen, title: "Academic Tracking", description: "Complete grade management with CBC & 8-4-4 curriculum support and analytics", highlight: true },
  { category: "Core", icon: ClipboardList, title: "Attendance System", description: "1-click digital attendance with instant parent SMS/email alerts", highlight: true },
  { category: "Core", icon: Calendar, title: "Timetable Management", description: "Automated class scheduling, exam timetables, and room allocation", highlight: false },
  
  // Assessment & Curriculum (AI-Powered)
  { category: "Assessment", icon: FileEdit, title: "Exam Paper Builder", description: "AI-powered exam generation with templates, formatting, and PDF export", highlight: true, isNew: true, isAI: true },
  { category: "Assessment", icon: HelpCircle, title: "Question Bank", description: "Growing question repository organized by topic, difficulty, and Bloom's taxonomy", highlight: true, isNew: true },
  { category: "Assessment", icon: BookMarked, title: "Lesson Planning", description: "AI-assisted lesson plans with CBC learning outcomes and resources", highlight: true, isNew: true, isAI: true },
  { category: "Assessment", icon: NotebookPen, title: "Student Diary", description: "Digital homework diary with real-time parent visibility", highlight: false, isNew: true },
  { category: "Assessment", icon: FileText, title: "CBC Report Cards", description: "Professional report cards with rubric grading and performance analytics", highlight: true },
  
  // Finance Module - 95% On-Time Collection
  { category: "Finance", icon: CreditCard, title: "M-Pesa Fee Collection", description: "95% on-time collection via real-time M-Pesa STK Push integration", highlight: true },
  { category: "Finance", icon: Wallet, title: "Double-Entry Ledger", description: "Full chart of accounts, journal entries, and trial balance", highlight: true },
  { category: "Finance", icon: Calculator, title: "Fund Accounting", description: "Votehead tracking, capitation grants, and multi-fund management", highlight: false },
  { category: "Finance", icon: Receipt, title: "Invoicing & Receipts", description: "Automated invoicing with custom fee structures and instant receipts", highlight: true },
  { category: "Finance", icon: TrendingUp, title: "Financial Reports", description: "Balance sheets, income statements, and cash flow analysis", highlight: false },
  { category: "Finance", icon: Bell, title: "Payment Reminders", description: "Automated SMS/email reminders that boost collection rates 40%", highlight: true },
  { category: "Finance", icon: DollarSign, title: "Discounts & Penalties", description: "Scholarships, bursaries, and automated late fee management", highlight: false },
  
  // HR & Staff Module
  { category: "HR", icon: UserCheck, title: "Staff Management", description: "Complete employee records, contracts, documents, and qualifications", highlight: true },
  { category: "HR", icon: Wallet, title: "Payroll System", description: "Seamless salary processing with PAYE, NHIF, NSSF deductions", highlight: true },
  { category: "HR", icon: Receipt, title: "Payslips", description: "Digital payslips with full allowances and deductions breakdown", highlight: false },
  { category: "HR", icon: Calendar, title: "Leave Management", description: "Leave requests, approvals, balance tracking, and policy enforcement", highlight: true },
  { category: "HR", icon: Clock, title: "Staff Attendance", description: "Clock-in/out with biometric integration and attendance reports", highlight: false },
  
  // Communications Module - 50+ Touchpoints
  { category: "Communication", icon: Smartphone, title: "50+ Automated Alerts", description: "Birthdays, attendance, fees, grades - all automated, zero effort", highlight: true },
  { category: "Communication", icon: Send, title: "Bulk SMS & Email", description: "Targeted messaging to parents, staff, and students in seconds", highlight: true },
  { category: "Communication", icon: MessageSquare, title: "In-App Messaging", description: "Secure two-way chat between parents and teachers", highlight: true },
  { category: "Communication", icon: Megaphone, title: "Announcements", description: "School-wide and class-specific announcements with read receipts", highlight: false },
  
  // Facilities & Additional Modules
  { category: "Facilities", icon: Bus, title: "Transport Management", description: "Routes, subscriptions, driver tracking, and GPS integration", highlight: false },
  { category: "Facilities", icon: Building, title: "Hostel Management", description: "Bed allocation, boarding fees, and dormitory tracking", highlight: false },
  { category: "Facilities", icon: Library, title: "Library System", description: "Book catalog, loans, overdue tracking, and reservations", highlight: false },
  { category: "Facilities", icon: UtensilsCrossed, title: "Cafeteria & Tuckshop", description: "Meal orders, inventory management, and billing", highlight: false },
  { category: "Facilities", icon: Shirt, title: "Uniform Shop", description: "Online ordering with inventory and parent portal integration", highlight: false },
  { category: "Facilities", icon: GraduationCap, title: "Activities & Events", description: "Extracurricular clubs, sports teams, and event management", highlight: false },
];

// Original EDUSUITE_FEATURES for backward compatibility (updated with new features)
export const EDUSUITE_FEATURES = [
  { icon: Users, title: "Student Management", description: "Complete student records, enrollment, and academic history" },
  { icon: CreditCard, title: "M-Pesa Fee Collection", description: "Automated fee collection with real-time reconciliation" },
  { icon: BookOpen, title: "Academic Tracking", description: "Grades, exams, assignments, and report cards" },
  { icon: FileEdit, title: "Exam Paper Builder", description: "AI-assisted exam creation with question banks", isNew: true, isAI: true },
  { icon: HelpCircle, title: "Question Bank", description: "Growing repository organized by topic and difficulty", isNew: true },
  { icon: BookMarked, title: "Lesson Planning", description: "CBC-aligned lesson plans with AI assistance", isNew: true, isAI: true },
  { icon: Bell, title: "Parent Portal", description: "Real-time updates on fees, grades, and announcements" },
  { icon: ClipboardList, title: "Attendance", description: "Digital attendance with SMS notifications" },
  { icon: Bus, title: "Transport Management", description: "Route planning, subscriptions, and tracking" },
  { icon: Building, title: "Hostel Management", description: "Bed allocation, boarding fees, and dormitory tracking" },
  { icon: Calendar, title: "Timetable", description: "Automated scheduling for classes and exams" },
  { icon: MessageSquare, title: "Communication Hub", description: "50+ automated SMS, email & in-app alerts" },
];

// PORTAL CAPABILITIES - Expanded with detailed features
export const EDUSUITE_PORTAL_DETAILS = [
  {
    name: "Admin Portal",
    color: "orange",
    icon: Shield,
    capabilities: [
      "Complete system configuration & settings",
      "Financial dashboard with real-time analytics",
      "Staff management, payroll & HR",
      "Student enrollment & records management",
      "Communication & notification management",
      "Reports, analytics & audit logs",
    ],
    keyFeature: "Full System Control",
  },
  {
    name: "Teacher Portal",
    color: "blue",
    icon: BookOpen,
    capabilities: [
      "Quick grade entry & report cards",
      "Attendance marking (takes seconds)",
      "Assignment creation & grading",
      "Class timetables & schedules",
      "Direct parent messaging",
      "Student performance tracking",
    ],
    keyFeature: "1-Click Attendance",
  },
  {
    name: "Parent Portal",
    color: "green",
    icon: Users,
    capabilities: [
      "Real-time fee balance & statements",
      "Pay fees via M-Pesa instantly",
      "View academic results & progress",
      "Attendance history & notifications",
      "Direct teacher messaging",
      "Event & activity updates",
    ],
    keyFeature: "M-Pesa Fee Payment",
  },
  {
    name: "Student Portal",
    color: "purple",
    icon: GraduationCap,
    capabilities: [
      "Online assignment submissions",
      "View exam results & grades",
      "Class timetable access",
      "Library resource booking",
      "Event calendar & activities",
      "Personal profile management",
    ],
    keyFeature: "Assignment Hub",
  },
];

// Original EDUSUITE_PORTALS for backward compatibility
export const EDUSUITE_PORTALS = [
  { name: "Admin Portal", description: "Full system control and reporting", color: "orange" },
  { name: "Teacher Portal", description: "Grades, attendance, and assignments", color: "blue" },
  { name: "Parent Portal", description: "Fees, results, and communication", color: "green" },
  { name: "Student Portal", description: "Assignments, results, and timetable", color: "purple" },
];

// COMMUNICATIONS FEATURE DETAIL - Critical selling point
export const COMMUNICATION_FEATURES = {
  headline: "50+ Automated Communication Touchpoints",
  impactStatement: "Never miss a moment - automatic notifications for everything",
  categories: [
    { name: "Celebrations", count: 2, examples: ["Birthday wishes to students", "Staff anniversaries"] },
    { name: "Attendance", count: 4, examples: ["Absent alerts", "Late notifications", "Weekly summary", "Check-in/out"] },
    { name: "Finance", count: 6, examples: ["Payment confirmations", "Due reminders", "Overdue alerts", "Statement updates", "Penalty notices", "Balance updates"] },
    { name: "Academic", count: 8, examples: ["Grade releases", "Assignment due", "Report card ready", "Exam schedules", "Submission received", "Teacher feedback"] },
    { name: "Library", count: 3, examples: ["Due date reminders", "Overdue book alerts", "Reservation ready"] },
    { name: "Transport", count: 4, examples: ["Bus departure", "Pickup notification", "Route changes", "Delay alerts"] },
    { name: "Activities", count: 3, examples: ["Event reminders", "Activity updates", "Enrollment confirmations"] },
  ],
  channels: ["SMS", "Email", "In-App Notifications", "Push Notifications"],
  integrations: ["Roberms SMS Gateway", "Resend Email", "Custom Webhooks"],
};

// SECURITY FEATURES - For compliance-conscious buyers
export const SECURITY_FEATURES = [
  { title: "Bank-Level Encryption", description: "256-bit SSL encryption for all data", icon: Lock },
  { title: "PCI DSS Compliant", description: "Payment processing meets global standards", icon: CreditCard },
  { title: "99.9% Uptime", description: "Platform availability guarantee", icon: Server },
  { title: "Daily Backups", description: "Automated daily data backups", icon: History },
  { title: "Role-Based Access", description: "Granular permission controls", icon: Key },
  { title: "Audit Logging", description: "Complete action history tracking", icon: FileText },
];

export const PAYMENT_INTEGRATIONS = [
  { name: "M-Pesa", logo: "mpesa", description: "Safaricom mobile money - Real-time STK Push" },
  { name: "KCB Bank", logo: "kcb", description: "Kenya Commercial Bank integration" },
  { name: "Equity Bank", logo: "equity", description: "Equity Bank Kenya direct payments" },
  { name: "Co-operative Bank", logo: "coop", description: "Co-op Bank Kenya paybill" },
];

export const IMPACT_STATS = [
  { value: "1,000+", label: "Schools", description: "Educational institutions" },
  { value: "500,000+", label: "Students", description: "Learners managed" },
  { value: "KES 10B+", label: "Fees Collected", description: "Through our platform" },
  { value: "99.9%", label: "Uptime", description: "Platform reliability" },
];

// Impact metrics for testimonials and marketing
export const KEY_METRICS = [
  { metric: "40%", description: "Increase in on-time fee payments" },
  { metric: "95%", description: "Fee collection rate achieved" },
  { metric: "2 days", description: "Average training time for staff" },
  { metric: "60%", description: "Reduction in admin workload" },
  { metric: "10x", description: "Faster attendance tracking" },
];

export const SCHOOL_TESTIMONIALS = [
  {
    quote: "Zira EduSuite transformed how we manage our school. Fee collection via M-Pesa increased our on-time payments by 40%. Parents love the real-time updates!",
    name: "Mary W.",
    role: "Principal",
    highlight: "40% increase in on-time payments",
  },
  {
    quote: "The parent portal has dramatically reduced our administrative burden. We spend less time on phone calls and more time on what matters - education.",
    name: "James O.",
    role: "Head Teacher",
    highlight: "Reduced administrative burden",
  },
  {
    quote: "Implementation was smooth and the support team is excellent. Our teachers now mark attendance in seconds instead of minutes. Highly recommended!",
    name: "Grace M.",
    role: "School Administrator",
    highlight: "Seamless implementation",
  },
  {
    quote: "The M-Pesa integration has been a game changer. We now receive 95% of fees on time. The automated reminders save us countless hours every month.",
    name: "Peter K.",
    role: "Finance Director",
    highlight: "95% on-time fee collection",
  },
  {
    quote: "Training took just 2 days and now our entire staff uses it daily. The CBC curriculum support is exactly what we needed for the new education system.",
    name: "Sarah A.",
    role: "ICT Coordinator",
    highlight: "2-day training rollout",
  },
];

export const EDUSUITE_PRICING = [
  { tier: "Micro", students: "1-100", publicAnnual: 16000, privateAnnual: 20000, publicSetup: 18000, privateSetup: 22500 },
  { tier: "Small", students: "101-250", publicAnnual: 21000, privateAnnual: 26250, publicSetup: 23000, privateSetup: 28750 },
  { tier: "Medium", students: "251-450", publicAnnual: 30000, privateAnnual: 37500, publicSetup: 32000, privateSetup: 40000 },
  { tier: "Standard", students: "451-650", publicAnnual: 40000, privateAnnual: 50000, publicSetup: 45000, privateSetup: 56250 },
  { tier: "Large", students: "651-900", publicAnnual: 51000, privateAnnual: 63750, publicSetup: 55000, privateSetup: 68750 },
  { tier: "Extra Large", students: "901-1,200", publicAnnual: 65000, privateAnnual: 81250, publicSetup: 70000, privateSetup: 87500 },
  { tier: "Jumbo", students: "1,201-1,800", publicAnnual: 87000, privateAnnual: 108750, publicSetup: 92000, privateSetup: 115000 },
  { tier: "Mega", students: "1,801+", custom: true },
];

export const COMPANY_IMAGES = {
  // School compound/institution exterior - African school buildings
  schoolBuilding: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
  // African students learning with books/technology
  studentsLearning: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&q=80",
  // African teacher with students in classroom setting
  teacherClassroom: "https://images.unsplash.com/photo-1613896640171-4d8c2e0f3b6c?w=1200&q=80",
  // African students using technology/tablets
  studentsTechnology: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80",
  // African graduation/success imagery
  graduation: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=800&q=80",
};

export const WHY_CHOOSE_ZIRA = [
  {
    icon: Globe,
    title: "Local",
    description: "Built specifically for Kenyan and African markets with local payment integrations.",
    color: "orange",
  },
  {
    icon: Zap,
    title: "Integrated",
    description: "M-Pesa and bank integrations out of the box. No additional setup required.",
    color: "yellow",
  },
  {
    icon: Users,
    title: "Proven",
    description: "1,000+ schools, 500,000+ students trust our platform daily.",
    color: "blue",
  },
  {
    icon: Share2,
    title: "Innovative",
    description: "AI-powered features across all platforms for enhanced productivity.",
    color: "purple",
  },
  {
    icon: Headphones,
    title: "Supported",
    description: "Dedicated onboarding, training, and ongoing support for all clients.",
    color: "green",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Bank-level security with 99.9% uptime and regular backups.",
    color: "red",
  },
];

// KEY FEATURES LIST - Used for consistent "All tiers include" sections
export const KEY_FEATURES_LIST = [
  "Student & Staff Management",
  "M-Pesa Fee Collection",
  "Academic Tracking & Report Cards",
  "Parent & Student Portals",
  "Exam Paper Builder",
  "Question Bank",
  "SMS & Email Notifications",
  "CBC & 8-4-4 Curriculum Support",
  "Free Training & Support",
];

// Assessment category color for PDF
export const ASSESSMENT_COLOR: [number, number, number] = [234, 88, 12]; // Orange-600
