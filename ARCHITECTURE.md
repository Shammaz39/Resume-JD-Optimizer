# System Architecture & Business Rules

This document outlines the architecture, technology stack, and business rules powering the **Resume JD Optimizer** application.

## 1. System Architecture

### 1.1 Tech Stack
*   **Frontend Framework:** React 19 + Vite.
*   **Styling:** Tailwind CSS v4, initialized alongside plain CSS (`index.css`, `Resume.css`).
*   **Icons:** `lucide-react`.
*   **PDF Generation:** `@react-pdf/renderer` handles the document creation directly in the browser.
*   **Animations:** `framer-motion` for UI transitions.

### 1.2 Core Components & Structure
*   `App.jsx`: The main layout wrapper incorporating consistent background styling and organizing the two-column grid (Left: Inputs/Analysis, Right: Preview).
*   **State Management (`context/ResumeContext.jsx`)**: 
    *   Centralized React Context providing the resume data model, settings, and base snapshot functionality.
    *   Keeps track of visibility toggles for sections and font sizes.
*   **Form Modules (`components/ResumeForm.jsx`, `components/JDInput.jsx`)**:
    *   Controlled inputs updating the central context. Allows entering personal info, skills grouped by category, experience, and projects.
*   **Analysis Module (`components/Analysis.jsx`)**:
    *   Displays the real-time match percentage, missing keywords, and line-by-line actionable suggestions based on utility algorithms.
*   **PDF Engine (`components/ResumePDF.jsx`) & WYSIWYG (`components/ResumePreview.jsx`)**:
    *   **PDF Generation:** Uses `@react-pdf/renderer` to define specific localized fonts (Source Serif Pro, Inter, etc.) and fixed A4 page dimensions to generate the downloadable PDF.
    *   **Live Preview:** Simulates A4 paging logic by calculating raw heights (841.89pt minus margins) to determine page breaks on the fly, rendering a pixel-perfect preview that exactly mirrors the output of `ResumePDF.jsx`.

---

## 2. Business Logic & Processing Rules

The application uses specific heuristics and rules to evaluate resumes against Job Descriptions. These are housed within `src/utils/`.

### 2.1 Keyword Extraction (`keywordExtractor.js`)
*   **Categorization:** Extracts keywords via word boundaries (`\b`) matching against an internal dictionary categorized into: *languages, frameworks, architecture, databases, devops, messaging, cloud, testing*.
*   **Normalization:** Unifies terminology to ensure correct matching (e.g., `golang` $\rightarrow$ `Go`, `restful api` \rightarrow `REST API`, `postgres` $\rightarrow$ `PostgreSQL`).
*   **Noise Reduction:** Specifically identifies and strips out company descriptions and boilerplate ("about the company", "who we are") from the Job Description text before extraction to avoid false positives.

### 2.2 JD Matching & Scoring Engine (`compareKeywords`)
When comparing extracted JD keywords against the Resume:
*   **Weighted Scoring:** Keywords are scored differently based on where they appear in the resume to prioritize practical experience over mere listings:
    *   Experience matching = `2.0x` weight.
    *   Projects matching = `1.5x` weight.
    *   Skills container matching = `1.0x` weight.
*   **Programming Language "OR" Rule:** If a JD requests multiple programming languages (e.g., "Python or Java"), finding *any* specified language on the applicant's resume will satisfy the entire language group requirement without penalizing the score for missing the alternatives.

