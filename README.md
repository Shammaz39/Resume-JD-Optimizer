# Resume JD Optimizer

A powerful, entirely client-side, privacy-first Resume Builder and Job Description (JD) Optimizer built using React and `@react-pdf/renderer`. 

This application offers pixel-perfect WYSIWYG editing, meaning the layout and live preview you see locally are perfectly 1:1 with the exported PDF. Customization options give you granular control over the design to create ATS-friendly, beautiful resumes locally.

## Features

- **True WYSIWYG Preview**: Live, pixel-perfect rendering of your final PDF.
- **Granular Customizations**: Modify line heights, spacing, margins, layout column styling, and font typography dynamically.
- **Header Customizations**: Adjust whether personal details are inline, separated, or compact.
- **Skills Variations**: Format your core skills with bullets, hyphens, or inline comma separations.
- **Privacy First**: Everything renders strictly inside your browser instance using `react-pdf`. No user data is sent to external servers.
- **JD Optimizer Tool**: Built-in logic matches resumes against provided Job Descriptions, dynamically scoring keyword densities and generating actionable insights to match specific tech stacks.

## Getting Started

Follow these steps to run the builder locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- `npm` or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shammaz39/Resume-JD-Optimizer.git
   cd Resume-JD-Optimizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the address shown in your terminal (usually `http://localhost:5173/`).

## How to use and modify the Application

The architecture is split logically into context models and UI visualizers:

### 1. The Settings Context (`src/context/ResumeContext.jsx`)
This file is the **Source of Truth** for the application. If you want to change default margins, set a different default font, or swap out the default placeholder data when the application boots, you should edit the `INITIAL_RESUME` state here.

### 2. The PDF Engine (`src/components/ResumePDF.jsx`)
This is the core renderer powering both the WYSIWYG preview and the PDF export. 
- If you want to change how a section divider line looks, adjust the `sectionHeader` styles. 
- If you want to build a completely new rendering style for Experience blocks, modify the `experience` property inside the `sectionRenderers` map.

### 3. The Form Interface (`src/components/ResumeForm.jsx`)
The user interface on the left-hand side. 
- You can add or drop input variables here and map them down into the global `updateResume()` binder to pass them safely into the context.

### 4. The Preview Frame (`src/components/ResumePreview.jsx`)
Simply wraps the `ResumePDF` and handles the Download PDF interface.

## Tech Stack
- React (Vite)
- Tailwind CSS (Interface styling)
- `@react-pdf/renderer` (Document generation)
- Lucide React (Icons)
