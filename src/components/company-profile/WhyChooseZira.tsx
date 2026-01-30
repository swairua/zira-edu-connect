import { WHY_CHOOSE_ZIRA } from "@/lib/company-data";

export const WhyChooseZira = () => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400';
      case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
      case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400';
      case 'green': return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400';
      case 'red': return 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-[#F97316]/5 via-background to-[#1E3A5A]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-[#F97316]">Zira</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The trusted technology partner for African businesses
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {WHY_CHOOSE_ZIRA.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl ${getColorClasses(reason.color)} flex items-center justify-center mb-4`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
