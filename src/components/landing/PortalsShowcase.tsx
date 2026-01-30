import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  CheckCircle2,
  CreditCard,
  BookOpen,
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  Play,
  LayoutDashboard
} from "lucide-react";

// Import portal screenshots
import studentPortalImg from "@/assets/screenshots/student-portal.png";
import teacherPortalImg from "@/assets/screenshots/teacher-portal.png";
import parentPortalImg from "@/assets/screenshots/parent-portal.png";
import adminDashboardImg from "@/assets/screenshots/admin-dashboard.png";

const portals = [
  {
    id: "parent",
    icon: Users,
    title: "Parent Portal",
    description: "Empower parents with real-time access to their child's education",
    features: [
      { icon: CreditCard, text: "View and pay fees via M-Pesa" },
      { icon: BookOpen, text: "Track academic performance" },
      { icon: Calendar, text: "See attendance records" },
      { icon: MessageSquare, text: "Communicate with teachers" },
      { icon: FileText, text: "Download report cards" },
      { icon: Bell, text: "Receive instant notifications" },
    ],
    color: "landing-blue",
    bgGradient: "from-landing-blue/10 to-landing-blue/5",
    screenshot: parentPortalImg,
    demoUrl: "/auth?demo=parent",
  },
  {
    id: "student",
    icon: GraduationCap,
    title: "Student Portal",
    description: "Give students ownership of their learning journey",
    features: [
      { icon: BookOpen, text: "Access learning materials" },
      { icon: FileText, text: "Submit assignments online" },
      { icon: Calendar, text: "View class timetables" },
      { icon: CheckCircle2, text: "Track grades and progress" },
      { icon: Bell, text: "Get assignment reminders" },
      { icon: MessageSquare, text: "Participate in discussions" },
    ],
    color: "landing-coral",
    bgGradient: "from-landing-coral/10 to-landing-coral/5",
    screenshot: studentPortalImg,
    demoUrl: "/auth?demo=student",
  },
  {
    id: "teacher",
    icon: UserCheck,
    title: "Teacher Portal",
    description: "Streamline teaching and administrative tasks",
    features: [
      { icon: Users, text: "Manage class rosters" },
      { icon: CheckCircle2, text: "Mark attendance instantly" },
      { icon: BookOpen, text: "Enter and manage grades" },
      { icon: FileText, text: "Create assignments" },
      { icon: MessageSquare, text: "Message parents directly" },
      { icon: Calendar, text: "View teaching schedule" },
    ],
    color: "primary",
    bgGradient: "from-primary/10 to-primary/5",
    screenshot: teacherPortalImg,
    demoUrl: "/auth?demo=teacher",
  },
  {
    id: "admin",
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description: "Complete control over your institution's operations",
    features: [
      { icon: Users, text: "Manage students & staff" },
      { icon: CreditCard, text: "Full financial oversight" },
      { icon: BookOpen, text: "Academic administration" },
      { icon: FileText, text: "Generate detailed reports" },
      { icon: Bell, text: "System-wide announcements" },
      { icon: Calendar, text: "Calendar & scheduling" },
    ],
    color: "landing-blue",
    bgGradient: "from-landing-blue/10 to-primary/5",
    screenshot: adminDashboardImg,
    demoUrl: "/auth?demo=admin",
  },
];

export const PortalsShowcase = () => {
  const [activeTab, setActiveTab] = useState("parent");

  return (
    <section id="portals" className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-landing-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-landing-coral/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-landing-coral/10 rounded-full mb-4">
            <span className="text-sm font-medium text-landing-coral">User Portals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Dedicated Portals for Everyone
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built interfaces for parents, students, teachers, and administrators
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 max-w-2xl mx-auto mb-12 h-auto p-1">
            {portals.map((portal) => (
              <TabsTrigger
                key={portal.id}
                value={portal.id}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-landing-blue data-[state=active]:to-primary data-[state=active]:text-white"
              >
                <portal.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{portal.title.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {portals.map((portal) => (
            <TabsContent key={portal.id} value={portal.id} className="mt-0">
              <div className={`grid lg:grid-cols-2 gap-12 items-center p-8 rounded-3xl bg-gradient-to-br ${portal.bgGradient}`}>
                {/* Portal Info */}
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-${portal.color}/10 flex items-center justify-center`}>
                    <portal.icon className={`w-8 h-8 text-${portal.color}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                      {portal.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {portal.description}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {portal.features.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${portal.color}/10 flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-4 h-4 text-${portal.color}`} />
                        </div>
                        <span className="text-sm text-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Demo Access Button */}
                  <Link 
                    to={portal.demoUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-landing-blue to-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-4 h-4" />
                    Try {portal.title.split(" ")[0]} Demo
                  </Link>
                </div>

                {/* Portal Screenshot */}
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                    {/* Browser Header */}
                    <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/30">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-6 bg-muted rounded-full flex items-center px-3">
                          <span className="text-xs text-muted-foreground">ziraedx.com</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actual Screenshot */}
                    <img 
                      src={portal.screenshot} 
                      alt={`${portal.title} Dashboard`}
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Floating notification */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-border/50 animate-bounce" style={{ animationDuration: "3s" }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-${portal.color}/10 flex items-center justify-center`}>
                        <Bell className={`w-4 h-4 text-${portal.color}`} />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">New update</div>
                        <div className="text-muted-foreground">Just now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
