import { 
  Users, 
  Wallet, 
  GraduationCap, 
  Briefcase, 
  MessageCircle, 
  BarChart3,
  ArrowRight,
  Landmark,
  Bus,
  BedDouble,
  BookOpen,
  Package,
  Calendar,
  FileEdit,
  BookMarked,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle from enrollment to graduation with digital records, attendance tracking, and parent linking.",
    color: "landing-blue",
    bgColor: "bg-landing-blue/10",
  },
  {
    icon: Wallet,
    title: "Fee Collection & M-Pesa",
    description: "Automated invoicing, M-Pesa integration, payment reminders, and real-time reconciliation for seamless fee management.",
    color: "landing-coral",
    bgColor: "bg-landing-coral/10",
  },
  {
    icon: GraduationCap,
    title: "Academic Tracking",
    description: "Grade management, exam scheduling, report cards, and comprehensive academic performance analytics.",
    color: "primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: FileEdit,
    title: "Exam Paper Builder",
    description: "AI-assisted exam creation with question banks, templates, and professional PDF export for all subjects.",
    color: "landing-coral",
    bgColor: "bg-landing-coral/10",
    isNew: true,
    isAI: true,
  },
  {
    icon: BookMarked,
    title: "Lesson Planning",
    description: "Digital lesson plans aligned with CBC learning outcomes, AI-generated content, and teacher resources.",
    color: "primary",
    bgColor: "bg-primary/10",
    isNew: true,
    isAI: true,
  },
  {
    icon: Briefcase,
    title: "Staff & HR",
    description: "Employee records, payroll processing, leave management, and performance evaluations in one place.",
    color: "landing-gold",
    bgColor: "bg-landing-gold/10",
  },
  {
    icon: MessageCircle,
    title: "Communication Hub",
    description: "50+ automated alerts, SMS notifications, parent messaging, and real-time announcements.",
    color: "landing-blue",
    bgColor: "bg-landing-blue/10",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Comprehensive dashboards, custom reports, and data insights to drive informed decisions.",
    color: "landing-coral",
    bgColor: "bg-landing-coral/10",
  },
  {
    icon: Landmark,
    title: "Finance Management",
    description: "Comprehensive budgeting, expense tracking, income management, and detailed financial reporting.",
    color: "primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Bus,
    title: "Transport Management",
    description: "Route planning, vehicle tracking, driver management, and student transport scheduling.",
    color: "landing-gold",
    bgColor: "bg-landing-gold/10",
  },
  {
    icon: BedDouble,
    title: "Boarding Management",
    description: "Hostel room allocation, meal planning, check-in/out tracking, and dormitory management.",
    color: "landing-blue",
    bgColor: "bg-landing-blue/10",
  },
  {
    icon: BookOpen,
    title: "Library Management",
    description: "Book cataloging, issue/return tracking, overdue management, and digital resources.",
    color: "landing-coral",
    bgColor: "bg-landing-coral/10",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Asset tracking, stock management, procurement, and maintenance scheduling.",
    color: "primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Timetable & Scheduling",
    description: "Class scheduling, exam timetables, resource allocation, and conflict detection.",
    color: "landing-gold",
    bgColor: "bg-landing-gold/10",
  },
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-landing-blue/10 rounded-full mb-4">
            <span className="text-sm font-medium text-landing-blue">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Run Your School
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed specifically for Kenyan schools, 
            from small primaries to large secondary institutions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl border border-border p-4 sm:p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* New/AI Badges */}
              {'isNew' in feature && feature.isNew && (
                <div className="absolute top-3 right-3 flex gap-1">
                  {'isAI' in feature && feature.isAI && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-landing-coral text-white text-xs font-medium rounded-full">
                    New
                  </span>
                </div>
              )}
              
              <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>

              <button className={`inline-flex items-center gap-1 text-${feature.color} font-medium text-sm group-hover:gap-2 transition-all`}>
                Learn more
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Hover Gradient Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-blue/20 via-landing-coral/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
