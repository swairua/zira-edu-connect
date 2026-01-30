import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is school management software?",
    answer: "School management software is a comprehensive digital platform that helps educational institutions automate and streamline their administrative tasks. Zira EduSuite handles student enrollment, fee collection, attendance tracking, academic records, staff management, and parent communication - all in one integrated system."
  },
  {
    question: "How does M-Pesa integration work with Zira EduSuite?",
    answer: "Our M-Pesa integration allows parents to pay school fees directly through their mobile phones. Payments are automatically recorded in the system, receipts are generated instantly, and administrators can track all transactions in real-time. This eliminates manual reconciliation and reduces payment delays."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! Zira EduSuite offers a free trial period where you can explore all features with no commitment. You can set up your school, add students, test fee collection, and experience the full platform before making a decision."
  },
  {
    question: "How many schools in Kenya use Zira EduSuite?",
    answer: "Zira EduSuite is trusted by over 1,000 schools across Kenya and East Africa, managing more than 500,000 students. Our schools range from primary schools to secondary schools, both public and private institutions, including CBC and 8-4-4 curriculum schools."
  },
  {
    question: "What support is available?",
    answer: "We provide comprehensive support including onboarding assistance, training for your staff, 24/7 technical support via phone and email, and regular system updates. Our team is based in Kenya and understands the local education system requirements."
  },
  {
    question: "Can parents access the system?",
    answer: "Yes! Zira EduSuite includes a dedicated Parent Portal where parents can view their children's academic progress, attendance records, upcoming assignments, fee balances, and communicate directly with teachers. Parents receive real-time notifications about important updates."
  },
  {
    question: "Is my school data secure?",
    answer: "Absolutely. We use bank-level encryption to protect all data. Our servers are secure and backed up regularly. We comply with data protection regulations and your school retains full ownership of all data. We never share your information with third parties."
  },
  {
    question: "How long does it take to set up?",
    answer: "Most schools are fully operational within 1-2 weeks. Our team handles the initial setup, data migration from existing systems, and staff training. We work around your schedule to ensure minimal disruption to school operations."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/30" id="faq">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Got Questions? We've Got Answers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Zira EduSuite and how it can transform your school management.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-background border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Contact our team →
          </a>
        </div>
      </div>
    </section>
  );
};

// Export FAQs for structured data
export const faqData = faqs;
