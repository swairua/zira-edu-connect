import { useEffect } from "react";

interface StructuredDataProps {
  data: object | object[];
}

export const StructuredData = ({ data }: StructuredDataProps) => {
  useEffect(() => {
    const scriptId = "structured-data-script";
    
    // Remove existing script if any
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

// Predefined schema for Zira EduSuite
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Zira EduSuite",
  "description": "Complete school management software solution trusted by 1,000+ schools in Kenya and Africa",
  "url": "https://zira-edusuite.lovable.app",
  "logo": "https://zira-edusuite.lovable.app/lovable-uploads/c37a673f-b3c2-45ac-9436-18b00ec6d20a.png",
  "sameAs": [
    "https://twitter.com/ziraedusuite",
    "https://linkedin.com/company/ziraedusuite",
    "https://facebook.com/ziraedusuite"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Venus Complex, Northern Bypass",
    "addressLocality": "Nairobi",
    "addressCountry": "KE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+254-757-878023",
    "email": "support@ziratech.com",
    "contactType": "customer service",
    "availableLanguage": ["English", "Swahili"]
  }
});

export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Zira EduSuite",
  "url": "https://zira-edusuite.lovable.app",
  "description": "Complete school management software for Kenya",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://zira-edusuite.lovable.app/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const getSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Zira EduSuite",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "School Management Software",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KES",
    "description": "Free 14-day trial available"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "2500",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "M-Pesa Fee Collection Integration",
    "Student Information Management",
    "Academic Performance Tracking",
    "Parent Portal Access",
    "Staff Management",
    "Attendance Tracking",
    "Exam & Grade Management",
    "Communication Tools",
    "CBC Curriculum Support",
    "KCPE/KCSE Exam Management",
    "Transport & Boarding Management"
  ]
});

export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
