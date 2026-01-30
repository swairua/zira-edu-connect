import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  COMPANY_INFO, 
  COMPANY_IMAGES,
  PLATFORMS, 
  EDUSUITE_MODULES,
  EDUSUITE_PORTAL_DETAILS,
  COMMUNICATION_FEATURES,
  SECURITY_FEATURES,
  IMPACT_STATS, 
  SCHOOL_TESTIMONIALS,
  EDUSUITE_PRICING,
  WHY_CHOOSE_ZIRA,
  PAYMENT_INTEGRATIONS
} from "@/lib/company-data";

// Colors as tuples
const ZIRA_ORANGE: [number, number, number] = [249, 115, 22];
const ZIRA_NAVY: [number, number, number] = [30, 58, 90];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK_TEXT: [number, number, number] = [15, 23, 42];
const GRAY_TEXT: [number, number, number] = [71, 85, 105];
const LIGHT_BG: [number, number, number] = [248, 250, 252];

// Font size constants for consistent typography hierarchy
const FONT_SIZES = {
  headline: 18,
  sectionTitle: 14,
  cardTitle: 9,
  body: 7,
  small: 6,
  badge: 6,
  footer: 8,
  moduleTitle: 8,
  moduleDesc: 7,
  portalCap: 6,
};

// Platform colors for visual cards
const PLATFORM_COLORS: [number, number, number][] = [
  [249, 115, 22],  // Orange - EduSuite
  [59, 130, 246],  // Blue - Homes
  [168, 85, 247],  // Purple - Lock
  [34, 197, 94],   // Green - SMS
  [236, 72, 153],  // Pink - Social
  [20, 184, 166],  // Teal - Shop
];

// Portal colors
const PORTAL_COLORS: [number, number, number][] = [
  [249, 115, 22],  // Admin - Orange
  [59, 130, 246],  // Teacher - Blue
  [34, 197, 94],   // Parent - Green
  [168, 85, 247],  // Student - Purple
];

// Category colors for modules
const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  "Core": [59, 130, 246],       // Blue
  "Assessment": [234, 88, 12],  // Orange-600
  "Finance": [34, 197, 94],     // Green
  "HR": [168, 85, 247],         // Purple
  "Communication": [249, 115, 22], // Orange
  "Facilities": [20, 184, 166],  // Teal
};

// Load image as base64 for PDF embedding
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    console.warn("Failed to load image:", url);
    return null;
  }
};

export const generateCompanyProfilePDF = async () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 0;
  let currentPage = 1;
  const totalPages = 8; // INCREASED from 7 to 8

  // Pre-load images
  const [schoolImage, studentsImage, logoImage] = await Promise.all([
    loadImageAsBase64(COMPANY_IMAGES.schoolBuilding),
    loadImageAsBase64(COMPANY_IMAGES.studentsTechnology),
    loadImageAsBase64("/zira-logo.png"),
  ]);

  // Helper functions
  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    yPos = margin;
  };

  const addPageFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFontSize(FONT_SIZES.footer);
    doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
    doc.text(`${COMPANY_INFO.website}  •  ${COMPANY_INFO.email}  •  ${COMPANY_INFO.phone}`, margin, footerY);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
    
    // Orange accent line
    doc.setDrawColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  };

  const drawGradientHeader = (height: number) => {
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.round(ZIRA_ORANGE[0] * (1 - ratio * 0.7) + ZIRA_NAVY[0] * ratio * 0.7);
      const g = Math.round(ZIRA_ORANGE[1] * (1 - ratio * 0.7) + ZIRA_NAVY[1] * ratio * 0.7);
      const b = Math.round(ZIRA_ORANGE[2] * (1 - ratio * 0.7) + ZIRA_NAVY[2] * ratio * 0.7);
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, "F");
    }
  };

  const addSectionTitle = (title: string, color: [number, number, number] = ZIRA_ORANGE) => {
    doc.setFontSize(FONT_SIZES.sectionTitle);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yPos);
    
    // Underline accent
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.8);
    const titleWidth = doc.getTextWidth(title);
    doc.line(margin, yPos + 1.5, margin + titleWidth, yPos + 1.5);
    
    yPos += 10;
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  };

  const drawColoredBox = (x: number, y: number, width: number, height: number, color: [number, number, number], opacity: number = 1) => {
    doc.setFillColor(
      Math.round(color[0] + (255 - color[0]) * (1 - opacity)),
      Math.round(color[1] + (255 - color[1]) * (1 - opacity)),
      Math.round(color[2] + (255 - color[2]) * (1 - opacity))
    );
    doc.roundedRect(x, y, width, height, 2, 2, "F");
  };

  const drawAccentCard = (x: number, y: number, width: number, height: number, accentColor: [number, number, number]) => {
    drawColoredBox(x, y, width, height, accentColor, 0.12);
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(x, y, 3, height, "F");
  };

  // ================== PAGE 1: COVER ==================
  drawGradientHeader(95);

  // Add subtle dot pattern overlay
  doc.setFillColor(255, 255, 255);
  for (let px = 0; px < pageWidth; px += 15) {
    for (let py = 8; py < 90; py += 15) {
      doc.circle(px, py, 0.25, "F");
    }
  }

  // Logo with proper aspect ratio (matching company profile page)
  yPos = 10;
  if (logoImage) {
    try {
      doc.setFillColor(255, 255, 255);
      // Taller container for proper logo aspect ratio
      doc.roundedRect(pageWidth / 2 - 25, yPos, 50, 35, 4, 4, "F");
      // Logo with correct 1.6:1 aspect ratio
      doc.addImage(logoImage, "PNG", pageWidth / 2 - 20, yPos + 5, 40, 25, undefined, "MEDIUM");
      yPos += 42;
    } catch (e) {
      console.warn("Failed to add logo to PDF");
      yPos += 12;
    }
  } else {
    yPos += 12;
  }

  // Add gap between logo and company name
  yPos += 8;

  // Company name
  doc.setFontSize(28);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name.toUpperCase(), pageWidth / 2, yPos, { align: "center" });

  // Decorative line
  yPos += 5;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 35, yPos, pageWidth / 2 + 35, yPos);

  // Tagline
  yPos += 9;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.tagline, pageWidth / 2, yPos, { align: "center" });

  // Contact bar - positioned below tagline with proper spacing
  yPos = 88;
  doc.setFontSize(FONT_SIZES.footer);
  doc.text(`${COMPANY_INFO.website}  •  ${COMPANY_INFO.email}  •  ${COMPANY_INFO.phone}`, pageWidth / 2, yPos, { align: "center" });

  // Impact stats boxes
  yPos = 103;
  const statWidth = (pageWidth - margin * 2 - 12) / 4;
  const statColors: [number, number, number][] = [ZIRA_ORANGE, [59, 130, 246], [34, 197, 94], [168, 85, 247]];
  
  IMPACT_STATS.forEach((stat, index) => {
    const x = margin + (statWidth + 4) * index;
    drawColoredBox(x, yPos, statWidth, 32, statColors[index]);
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(stat.value, x + statWidth / 2, yPos + 12, { align: "center" });
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont("helvetica", "normal");
    doc.text(stat.label, x + statWidth / 2, yPos + 20, { align: "center" });
    doc.setFontSize(FONT_SIZES.small);
    doc.text(stat.description, x + statWidth / 2, yPos + 26, { align: "center" });
  });

  // EXECUTIVE SUMMARY BOX (NEW)
  yPos = 142;
  doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 24, 2, 2, "F");
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(FONT_SIZES.cardTitle);
  doc.setFont("helvetica", "italic");
  const execSummary = "Kenya's most comprehensive school management platform, trusted by 1,000+ schools to manage 500,000+ students and collect over KES 10 billion in fees. AI-powered tools, M-Pesa integration, and 50+ automated communications deliver measurable ROI from day one.";
  const summaryLines = doc.splitTextToSize(execSummary, pageWidth - margin * 2 - 10);
  doc.text(summaryLines, margin + 5, yPos + 8);

  // About section with image
  yPos = 174;
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  addSectionTitle("About Zira Technologies");

  // School image
  if (schoolImage) {
    try {
      doc.addImage(schoolImage, "JPEG", margin, yPos, 45, 32, undefined, "MEDIUM");
    } catch (e) {
      console.warn("Failed to add school image to PDF");
    }
  }

  // About text next to image
  const aboutX = schoolImage ? margin + 50 : margin;
  const aboutWidth = schoolImage ? pageWidth - margin * 2 - 50 : pageWidth - margin * 2;
  
  doc.setFontSize(FONT_SIZES.cardTitle);
  doc.setFont("helvetica", "normal");
  const aboutText = `${COMPANY_INFO.name} is a Kenyan technology company building digital infrastructure for Africa's business revolution. Headquartered in ${COMPANY_INFO.headquarters}, we develop six technology platforms serving thousands of businesses across Kenya and East Africa.\n\nOur vision: ${COMPANY_INFO.vision}`;
  const aboutLines = doc.splitTextToSize(aboutText, aboutWidth);
  doc.text(aboutLines, aboutX, yPos + 5);

  // Key differentiator banner
  yPos = 216;
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 18, 2, 2, "F");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Purpose-Built for Kenyan Schools. Trusted Across Africa.", pageWidth / 2, yPos + 7, { align: "center" });
  doc.setFontSize(FONT_SIZES.footer);
  doc.setFont("helvetica", "normal");
  doc.text("M-Pesa Integration • CBC & 8-4-4 Curriculum Support • Local Payment Gateways • Kenyan Compliance", pageWidth / 2, yPos + 13, { align: "center" });

  // Mission & Vision section - colorful boxes
  yPos += 28;
  const mvBoxWidth = (pageWidth - margin * 2 - 8) / 2;
  const mvBoxHeight = 28;
  
  // Mission box - Orange
  doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.roundedRect(margin, yPos, mvBoxWidth, mvBoxHeight, 3, 3, "F");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Our Mission", margin + 8, yPos + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const missionLines = doc.splitTextToSize(COMPANY_INFO.mission, mvBoxWidth - 14);
  doc.text(missionLines.slice(0, 2), margin + 8, yPos + 15);
  
  // Vision box - Blue
  const VISION_BLUE: [number, number, number] = [30, 58, 90];
  doc.setFillColor(VISION_BLUE[0], VISION_BLUE[1], VISION_BLUE[2]);
  doc.roundedRect(margin + mvBoxWidth + 8, yPos, mvBoxWidth, mvBoxHeight, 3, 3, "F");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Our Vision", margin + mvBoxWidth + 16, yPos + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const visionLines = doc.splitTextToSize(COMPANY_INFO.vision, mvBoxWidth - 14);
  doc.text(visionLines.slice(0, 2), margin + mvBoxWidth + 16, yPos + 15);

  addPageFooter();

  // ================== PAGE 2: PLATFORM SUITE ==================
  addNewPage();

  // Orange header bar
  doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Our Platform Suite", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Six integrated technology platforms for African businesses", pageWidth / 2, 17, { align: "center" });

  yPos = 30;
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);

  // Platform cards - 2 columns, 3 rows
  const cardWidth = (pageWidth - margin * 2 - 6) / 2;
  const cardHeight = 38;
  
  PLATFORMS.forEach((platform, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (cardWidth + 6) * col;
    const y = yPos + (cardHeight + 5) * row;
    
    drawAccentCard(x, y, cardWidth, cardHeight, PLATFORM_COLORS[index]);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PLATFORM_COLORS[index][0], PLATFORM_COLORS[index][1], PLATFORM_COLORS[index][2]);
    doc.text(platform.name, x + 8, y + 9);
    
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(platform.description, cardWidth - 14);
    doc.text(descLines.slice(0, 2), x + 8, y + 17);
    
    doc.setFillColor(PLATFORM_COLORS[index][0], PLATFORM_COLORS[index][1], PLATFORM_COLORS[index][2]);
    const statsWidth = doc.getTextWidth(platform.stats) + 8;
    doc.roundedRect(x + 8, y + 28, statsWidth, 7, 1.5, 1.5, "F");
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont("helvetica", "bold");
    doc.text(platform.stats, x + 12, y + 33);
    
    if (platform.url) {
      doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
      doc.setFontSize(FONT_SIZES.small);
      doc.setFont("helvetica", "normal");
      doc.text(platform.url, x + cardWidth - 8, y + 33, { align: "right" });
    }
  });

  yPos += cardHeight * 3 + 22;

  // Company values
  addSectionTitle("Our Core Values");
  
  const valueWidth = (pageWidth - margin * 2 - 8) / 3;
  COMPANY_INFO.values.forEach((value, index) => {
    const x = margin + (valueWidth + 4) * index;
    drawAccentCard(x, yPos, valueWidth, 26, statColors[index]);
    
    doc.setFontSize(FONT_SIZES.cardTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(statColors[index][0], statColors[index][1], statColors[index][2]);
    doc.text(value.title, x + 8, yPos + 9);
    
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const valueDesc = doc.splitTextToSize(value.description, valueWidth - 12);
    doc.text(valueDesc.slice(0, 2), x + 8, yPos + 16);
  });

  addPageFooter();

  // ================== PAGE 3: EDUSUITE - ASSESSMENT & CORE ONLY ==================
  addNewPage();
  
  // Orange header bar with impact headline
  doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Zira EduSuite", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Kenya's Most Comprehensive School Management Platform", pageWidth / 2, 17, { align: "center" });
  doc.setFontSize(7);
  doc.text("Trusted by 1,000+ Schools  •  500,000+ Students  •  KES 10B+ Fees Collected", pageWidth / 2, 24, { align: "center" });

  yPos = 35;

  // Students image
  if (studentsImage) {
    try {
      doc.addImage(studentsImage, "JPEG", pageWidth - margin - 40, yPos, 40, 26, undefined, "MEDIUM");
    } catch (e) {
      console.warn("Failed to add students image to PDF");
    }
  }

  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(FONT_SIZES.cardTitle);
  doc.setFont("helvetica", "normal");
  const edusuiteIntro = "End-to-end student lifecycle management, from enrollment to graduation. Achieve 95% on-time fee collection via M-Pesa integration. All the tools your school needs in one integrated platform with white-glove onboarding support.";
  const edusuiteLines = doc.splitTextToSize(edusuiteIntro, pageWidth - margin * 2 - 45);
  doc.text(edusuiteLines, margin, yPos + 5);
  
  // CTA button with link to platform
  yPos = 65;
  doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.roundedRect(margin, yPos, 55, 10, 2, 2, "F");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Visit ziraedx.com", margin + 27.5, yPos + 6.5, { align: "center" });
  // Add clickable link area
  doc.link(margin, yPos, 55, 10, { url: "https://ziraedx.com" });
  
  yPos = 80;
  
  // ASSESSMENT & CURRICULUM SECTION (AI-Powered)
  doc.setFillColor(CATEGORY_COLORS["Assessment"][0], CATEGORY_COLORS["Assessment"][1], CATEGORY_COLORS["Assessment"][2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFontSize(FONT_SIZES.moduleTitle);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("ASSESSMENT & CURRICULUM - AI-Powered Exam Builder, Question Bank, Lesson Planning", margin + 4, yPos + 5);
  
  yPos += 12;
  const assessmentModules = EDUSUITE_MODULES.filter(m => m.category === "Assessment");
  const assessModuleWidth = (pageWidth - margin * 2 - 12) / 3;
  const assessModuleHeight = 22;
  
  assessmentModules.slice(0, 6).forEach((module, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + (assessModuleWidth + 6) * col;
    const y = yPos + (assessModuleHeight + 4) * row;
    
    drawAccentCard(x, y, assessModuleWidth, assessModuleHeight, CATEGORY_COLORS["Assessment"]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CATEGORY_COLORS["Assessment"][0], CATEGORY_COLORS["Assessment"][1], CATEGORY_COLORS["Assessment"][2]);
    
    const isAI = 'isAI' in module && module.isAI;
    doc.text(module.title + (isAI ? " ★AI" : ""), x + 6, y + 7);
    
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(module.description, assessModuleWidth - 8);
    doc.text(descLines.slice(0, 2), x + 6, y + 13);
  });
  
  yPos += (assessModuleHeight + 4) * 2 + 12;
  
  // CORE MANAGEMENT SECTION
  doc.setFillColor(CATEGORY_COLORS["Core"][0], CATEGORY_COLORS["Core"][1], CATEGORY_COLORS["Core"][2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFontSize(FONT_SIZES.moduleTitle);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("CORE MANAGEMENT - End-to-End Student Lifecycle Management", margin + 4, yPos + 5);
  
  yPos += 12;
  const coreModules = EDUSUITE_MODULES.filter(m => m.category === "Core");
  const moduleCardWidth = (pageWidth - margin * 2 - 6) / 2;
  const moduleCardHeight = 24;
  
  coreModules.forEach((module, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (moduleCardWidth + 6) * col;
    const y = yPos + (moduleCardHeight + 4) * row;
    
    drawAccentCard(x, y, moduleCardWidth, moduleCardHeight, CATEGORY_COLORS["Core"]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CATEGORY_COLORS["Core"][0], CATEGORY_COLORS["Core"][1], CATEGORY_COLORS["Core"][2]);
    doc.text(module.title, x + 7, y + 8);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(module.description, moduleCardWidth - 10);
    doc.text(descLines.slice(0, 2), x + 7, y + 15);
  });

  addPageFooter();

  // ================== PAGE 4: FINANCE, HR & COMMUNICATIONS ==================
  addNewPage();
  
  // Navy header
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Finance, HR & Communications", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Comprehensive back-office automation for modern schools", pageWidth / 2, 17, { align: "center" });

  yPos = 30;

  // FINANCE MODULE SECTION
  doc.setFillColor(CATEGORY_COLORS["Finance"][0], CATEGORY_COLORS["Finance"][1], CATEGORY_COLORS["Finance"][2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFontSize(FONT_SIZES.moduleTitle);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("COMPLETE FINANCE MODULE - 95% On-Time Fee Collection via M-Pesa", margin + 4, yPos + 5);
  
  yPos += 10;
  const financeModules = EDUSUITE_MODULES.filter(m => m.category === "Finance");
  const finModuleWidth = (pageWidth - margin * 2 - 12) / 3;
  const finModuleHeight = 20;
  
  financeModules.slice(0, 6).forEach((module, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + (finModuleWidth + 6) * col;
    const y = yPos + (finModuleHeight + 4) * row;
    
    drawAccentCard(x, y, finModuleWidth, finModuleHeight, CATEGORY_COLORS["Finance"]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CATEGORY_COLORS["Finance"][0], CATEGORY_COLORS["Finance"][1], CATEGORY_COLORS["Finance"][2]);
    doc.text(module.title, x + 6, y + 7);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(module.description, finModuleWidth - 8);
    doc.text(descLines.slice(0, 2), x + 6, y + 13);
  });
  
  yPos += (finModuleHeight + 4) * 2 + 8;
  
  // HR MODULE SECTION
  doc.setFillColor(CATEGORY_COLORS["HR"][0], CATEGORY_COLORS["HR"][1], CATEGORY_COLORS["HR"][2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 7, 1, 1, "F");
  doc.setFontSize(FONT_SIZES.moduleTitle);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("HR & STAFF MANAGEMENT - Payroll, Leave, Attendance, PAYE/NHIF/NSSF", margin + 4, yPos + 5);
  
  yPos += 10;
  const hrModules = EDUSUITE_MODULES.filter(m => m.category === "HR");
  
  hrModules.forEach((module, index) => {
    const col = index % 3;
    const x = margin + (finModuleWidth + 6) * col;
    
    drawAccentCard(x, yPos, finModuleWidth, finModuleHeight, CATEGORY_COLORS["HR"]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CATEGORY_COLORS["HR"][0], CATEGORY_COLORS["HR"][1], CATEGORY_COLORS["HR"][2]);
    doc.text(module.title, x + 6, yPos + 7);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(module.description, finModuleWidth - 8);
    doc.text(descLines.slice(0, 2), x + 6, yPos + 13);
  });
  
  yPos += finModuleHeight + 12;
  
  // COMMUNICATIONS SECTION (CRITICAL HIGHLIGHT)
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 3, 3, "F");
  
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(FONT_SIZES.sectionTitle);
  doc.setFont("helvetica", "bold");
  doc.text("50+ Automated Communication Touchpoints", margin + 8, yPos + 11);
  
  doc.setFontSize(FONT_SIZES.footer);
  doc.setFont("helvetica", "normal");
  doc.text("Never miss a moment - automatic SMS, Email & In-App notifications for everything", margin + 8, yPos + 20);
  
  // Categories grid
  const catWidth = 24;
  const categories = COMMUNICATION_FEATURES.categories;
  categories.forEach((cat, i) => {
    const x = margin + 8 + (i * (catWidth + 2));
    doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.roundedRect(x, yPos + 26, catWidth, 10, 1, 1, "F");
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont("helvetica", "bold");
    doc.text(cat.name, x + catWidth / 2, yPos + 32, { align: "center" });
  });
  
  // Channels
  doc.setFontSize(FONT_SIZES.body);
  doc.text("Channels: SMS  •  Email  •  In-App  •  Push Notifications", margin + 8, yPos + 44);

  addPageFooter();

  // ================== PAGE 5: PORTALS + FACILITIES ==================
  addNewPage();

  // Navy header
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Four Dedicated Portals", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(FONT_SIZES.cardTitle);
  doc.setFont("helvetica", "normal");
  doc.text("Role-based access for Admins, Teachers, Parents & Students", pageWidth / 2, 17, { align: "center" });

  yPos = 28;

  // Portal cards - 2x2 grid
  const portalWidth = (pageWidth - margin * 2 - 6) / 2;
  const portalHeight = 52;
  
  EDUSUITE_PORTAL_DETAILS.forEach((portal, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (portalWidth + 6) * col;
    const y = yPos + (portalHeight + 5) * row;
    
    drawAccentCard(x, y, portalWidth, portalHeight, PORTAL_COLORS[index]);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PORTAL_COLORS[index][0], PORTAL_COLORS[index][1], PORTAL_COLORS[index][2]);
    doc.text(portal.name, x + 8, y + 10);
    
    // Key feature badge
    doc.setFillColor(PORTAL_COLORS[index][0], PORTAL_COLORS[index][1], PORTAL_COLORS[index][2]);
    const badgeWidth = doc.getTextWidth(portal.keyFeature) + 8;
    doc.roundedRect(x + portalWidth - badgeWidth - 5, y + 5, badgeWidth, 9, 1.5, 1.5, "F");
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(FONT_SIZES.small);
    doc.text(portal.keyFeature, x + portalWidth - badgeWidth / 2 - 5, y + 11, { align: "center" });
    
    // Capabilities list
    doc.setFontSize(FONT_SIZES.portalCap);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    portal.capabilities.forEach((cap, capIndex) => {
      doc.text(`• ${cap}`, x + 8, y + 20 + (capIndex * 5));
    });
  });

  yPos += (portalHeight + 5) * 2 + 8;
  
  // FACILITIES MODULES
  addSectionTitle("Additional Modules");
  
  const facilityModules = EDUSUITE_MODULES.filter(m => m.category === "Facilities");
  const facModuleWidth = (pageWidth - margin * 2 - 12) / 3;
  const facModuleHeight = 18;
  
  facilityModules.forEach((module, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + (facModuleWidth + 6) * col;
    const y = yPos + (facModuleHeight + 3) * row;
    
    drawAccentCard(x, y, facModuleWidth, facModuleHeight, CATEGORY_COLORS["Facilities"]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(CATEGORY_COLORS["Facilities"][0], CATEGORY_COLORS["Facilities"][1], CATEGORY_COLORS["Facilities"][2]);
    doc.text(module.title, x + 6, y + 6);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(module.description, facModuleWidth - 8);
    doc.text(descLines.slice(0, 2), x + 6, y + 12);
  });

  addPageFooter();

  // ================== PAGE 6: PRICING ==================
  addNewPage();

  // Navy header
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("EduSuite Pricing", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Transparent Annual Pricing - Full Platform Access for All Schools", pageWidth / 2, 17, { align: "center" });

  yPos = 28;
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(FONT_SIZES.footer);
  doc.text("Choose the plan that fits your school size. All plans include full platform access to all modules and white-glove onboarding.", margin, yPos);
  yPos += 6;

  // Pricing table
  autoTable(doc, {
    startY: yPos,
    head: [["Tier", "Students", "Public School (Annual)", "Private School (Annual)"]],
    body: EDUSUITE_PRICING.map(p => [
      p.tier,
      p.students,
      p.custom ? "Contact Sales" : `KES ${p.publicAnnual?.toLocaleString()}`,
      p.custom ? "Contact Sales" : `KES ${p.privateAnnual?.toLocaleString()}`
    ]),
    theme: "striped",
    headStyles: { fillColor: ZIRA_ORANGE, textColor: WHITE, fontStyle: "bold", fontSize: FONT_SIZES.footer },
    alternateRowStyles: { fillColor: LIGHT_BG },
    margin: { left: margin, right: margin },
    styles: { fontSize: FONT_SIZES.body, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // PRICING NOTES - CLEAN GRID LAYOUT (Fixed)
  drawColoredBox(margin, yPos, pageWidth - margin * 2, 22, LIGHT_BG);
  
  const pricingNotes = [
    ["✓ First-year setup fees apply", "✓ 14-day free trial available"],
    ["✓ Private school rates include premium support", "✓ Monthly and termly payment options"],
    ["✓ Includes free training and onboarding", "✓ No hidden costs or surprises"],
  ];
  
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  
  const noteColWidth = (pageWidth - margin * 2 - 8) / 2;
  pricingNotes.forEach((row, rowIndex) => {
    row.forEach((note, colIndex) => {
      const x = margin + 4 + (colIndex * noteColWidth);
      const y = yPos + 6 + (rowIndex * 6);
      doc.text(note, x, y);
    });
  });
  
  yPos += 30;

  // Payment Integrations
  addSectionTitle("Payment Integrations");
  
  const intWidth = (pageWidth - margin * 2 - 12) / 4;
  PAYMENT_INTEGRATIONS.forEach((integration, index) => {
    const x = margin + (intWidth + 4) * index;
    drawAccentCard(x, yPos, intWidth, 22, [34, 197, 94]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor([34, 197, 94][0], [34, 197, 94][1], [34, 197, 94][2]);
    doc.text(integration.name, x + 6, yPos + 8);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const descLines = doc.splitTextToSize(integration.description, intWidth - 8);
    doc.text(descLines.slice(0, 2), x + 6, yPos + 14);
  });

  addPageFooter();

  // ================== PAGE 7: SECURITY + TESTIMONIALS ==================
  addNewPage();

  // Gradient header
  drawGradientHeader(22);
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Security, Compliance & Success Stories", pageWidth / 2, 12, { align: "center" });

  yPos = 28;

  // SECURITY & COMPLIANCE SECTION
  addSectionTitle("Security & Compliance", ZIRA_NAVY);
  
  doc.setFillColor(ZIRA_NAVY[0], ZIRA_NAVY[1], ZIRA_NAVY[2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 38, 3, 3, "F");
  
  const secWidth = (pageWidth - margin * 2 - 24) / 3;
  SECURITY_FEATURES.slice(0, 6).forEach((feature, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + 8 + col * (secWidth + 6);
    const y = yPos + 8 + row * 16;
    
    doc.setTextColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.setFontSize(FONT_SIZES.moduleTitle);
    doc.setFont("helvetica", "bold");
    doc.text(`✓ ${feature.title}`, x, y);
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(FONT_SIZES.moduleDesc);
    doc.setFont("helvetica", "normal");
    doc.text(feature.description, x + 3, y + 6);
  });

  yPos += 48;

  // Why Choose Zira - 2x3 Grid Cards
  addSectionTitle("Why Schools Choose Zira", ZIRA_ORANGE);
  
  const whyCardWidth = (pageWidth - margin * 2 - 8) / 3;
  const whyCardHeight = 28;
  
  WHY_CHOOSE_ZIRA.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + (whyCardWidth + 4) * col;
    const y = yPos + (whyCardHeight + 4) * row;
    
    const cardColor = statColors[index % statColors.length];
    drawAccentCard(x, y, whyCardWidth, whyCardHeight, cardColor);
    
    doc.setFontSize(FONT_SIZES.cardTitle);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cardColor[0], cardColor[1], cardColor[2]);
    doc.text(item.title, x + 8, y + 9);
    
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const itemDesc = doc.splitTextToSize(item.description, whyCardWidth - 12);
    doc.text(itemDesc.slice(0, 3), x + 8, y + 16);
  });

  yPos += (whyCardHeight + 4) * 2 + 10;
  
  // Testimonials - COMPACT 2x2 GRID
  addSectionTitle("What Educators Say", ZIRA_ORANGE);
  
  const testimonialWidth = (pageWidth - margin * 2 - 6) / 2;
  const testimonialHeight = 32;
  
  SCHOOL_TESTIMONIALS.slice(0, 4).forEach((testimonial, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (testimonialWidth + 6) * col;
    const y = yPos + (testimonialHeight + 4) * row;
    
    drawColoredBox(x, y, testimonialWidth, testimonialHeight, LIGHT_BG);
    
    // Orange accent bar
    doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.rect(x, y, 3, testimonialHeight, "F");
    
    // Quote - 2 lines max
    doc.setFontSize(FONT_SIZES.footer);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
    const quoteLines = doc.splitTextToSize(`"${testimonial.quote}"`, testimonialWidth - 14);
    doc.text(quoteLines.slice(0, 2), x + 7, y + 7);
    
    // Author info
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    doc.setFontSize(FONT_SIZES.body);
    doc.text(`— ${testimonial.name}, ${testimonial.role}`, x + 7, y + 21);
    
    // Highlight badge
    doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    const highlightWidth = doc.getTextWidth(testimonial.highlight) + 6;
    doc.roundedRect(x + testimonialWidth - highlightWidth - 4, y + 24, highlightWidth, 6, 1.5, 1.5, "F");
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont("helvetica", "bold");
    doc.text(testimonial.highlight, x + testimonialWidth - highlightWidth / 2 - 4, y + 28, { align: "center" });
  });

  addPageFooter();

  // ================== PAGE 8: CONTACT CTA ==================
  addNewPage();

  // Full gradient background
  drawGradientHeader(pageHeight);

  // Add dot pattern
  doc.setFillColor(255, 255, 255);
  for (let px = 0; px < pageWidth; px += 18) {
    for (let py = 25; py < pageHeight - 25; py += 18) {
      doc.circle(px, py, 0.2, "F");
    }
  }

  yPos = 45;
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to Transform", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.text("Your School?", pageWidth / 2, yPos, { align: "center" });

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Join 1,000+ schools already using Zira EduSuite", pageWidth / 2, yPos, { align: "center" });

  yPos += 20;
  
  // Contact info card
  doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.roundedRect(margin + 20, yPos, pageWidth - margin * 2 - 40, 55, 5, 5, "F");
  
  const contactY = yPos + 12;
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Get in Touch", pageWidth / 2, contactY, { align: "center" });
  
  // Contact details with styled labels (no emojis - jsPDF doesn't support Unicode emoji)
  const contactItems = [
    { label: "Email", value: COMPANY_INFO.email },
    { label: "Phone", value: COMPANY_INFO.phone },
    { label: "Website", value: COMPANY_INFO.website },
    { label: "Address", value: COMPANY_INFO.headquarters },
  ];

  contactItems.forEach((item, index) => {
    const y = contactY + 12 + (index * 10);
    
    // Orange bullet point
    doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.circle(pageWidth / 2 - 55, y - 1.5, 1.5, "F");
    
    // Bold label in orange
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
    doc.setFontSize(9);
    doc.text(item.label, pageWidth / 2 - 50, y);
    
    // Value text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    const labelWidth = doc.getTextWidth(item.label);
    doc.text(item.value, pageWidth / 2 - 50 + labelWidth + 3, y);
  });

  yPos += 70;
  
  // CTA buttons
  // Demo button
  doc.setFillColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.roundedRect(margin + 20, yPos, (pageWidth - margin * 2 - 50) / 2, 14, 3, 3, "F");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Schedule a Demo", margin + 20 + (pageWidth - margin * 2 - 50) / 4, yPos + 9, { align: "center" });
  
  // Free trial button
  doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.roundedRect(pageWidth / 2 + 5, yPos, (pageWidth - margin * 2 - 50) / 2, 14, 3, 3, "F");
  doc.setTextColor(ZIRA_ORANGE[0], ZIRA_ORANGE[1], ZIRA_ORANGE[2]);
  doc.text("Start 14-Day Free Trial", pageWidth / 2 + 5 + (pageWidth - margin * 2 - 50) / 4, yPos + 9, { align: "center" });

  yPos += 30;
  
  // Impact stats at bottom
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Trusted by 1,000+ Schools  •  500,000+ Students  •  KES 10B+ Fees Collected  •  99.9% Uptime", pageWidth / 2, yPos, { align: "center" });

  yPos += 20;
  
  // Final value proposition
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 30, yPos, pageWidth - margin * 2 - 60, 22, 3, 3, "F");
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const finalValue = "White-glove onboarding support • 2-day training rollout • Dedicated account manager • 24/7 support";
  doc.text(finalValue, pageWidth / 2, yPos + 12, { align: "center" });

  addPageFooter();

  // Save PDF
  doc.save(`Zira_Technologies_Company_Profile.pdf`);
};
