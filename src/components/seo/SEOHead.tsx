import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

export const SEOHead = ({
  title = "Zira EduSuite | Best School Management Software in Kenya | M-Pesa Integration",
  description = "Complete school management system trusted by 1,000+ schools in Kenya. Automate fee collection with M-Pesa, track academics, manage staff, and keep parents informed. Start your free trial today.",
  keywords = "school management software Kenya, school ERP Kenya, M-Pesa fee collection, student management system, school administration software Africa, school fees management, parent portal Kenya, academic tracking system, CBC school software Kenya, KCPE KCSE management system, Safaricom M-Pesa school fees, online school portal Kenya",
  canonicalUrl,
  ogImage = "/og-image.png",
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update standard meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    
    // Robots meta
    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", ogImage, true);
    
    if (canonicalUrl) {
      updateMetaTag("og:url", canonicalUrl, true);
      
      // Update or create canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }

    // Twitter Card tags
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);

    // Geo meta tags for Kenya
    updateMetaTag("geo.region", "KE");
    updateMetaTag("geo.placename", "Kenya");
    updateMetaTag("geo.position", "-1.286389;36.817223");
    updateMetaTag("ICBM", "-1.286389, 36.817223");

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex]);

  return null;
};
