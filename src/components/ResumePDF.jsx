import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image, Link } from '@react-pdf/renderer';

// Register All Professional Fonts Locally for 100% Reliability
// Using absolute paths if possible, but react-pdf prefers URLs or local paths relative to the build
const FONT_BASE = '/fonts';

// Source Serif (Source Serif 4)
Font.register({
    family: 'Source Serif Pro',
    fonts: [
        { src: `${FONT_BASE}/SourceSerif-Regular.ttf` },
        { src: `${FONT_BASE}/SourceSerif-Bold.ttf`, fontWeight: 700 }
    ]
});

// Inter
Font.register({
    family: 'Inter',
    fonts: [
        { src: `${FONT_BASE}/Inter-Regular.ttf` },
        { src: `${FONT_BASE}/Inter-Bold.ttf`, fontWeight: 700 }
    ]
});

// Roboto
Font.register({
    family: 'Roboto',
    fonts: [
        { src: `${FONT_BASE}/Roboto-Regular.ttf` },
        { src: `${FONT_BASE}/Roboto-Bold.ttf`, fontWeight: 700 }
    ]
});

// Open Sans
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: `${FONT_BASE}/OpenSans-Regular.ttf` },
        { src: `${FONT_BASE}/OpenSans-Bold.ttf`, fontWeight: 700 }
    ]
});

// Lato
Font.register({
    family: 'Lato',
    fonts: [
        { src: `${FONT_BASE}/Lato-Regular.ttf` },
        { src: `${FONT_BASE}/Lato-Bold.ttf`, fontWeight: 700 }
    ]
});

// Merriweather
Font.register({
    family: 'Merriweather',
    fonts: [
        { src: `${FONT_BASE}/Merriweather-Regular.ttf` },
        { src: `${FONT_BASE}/Merriweather-Bold.ttf`, fontWeight: 700 }
    ]
});

const getStyles = (settings) => {
    const fontSize = settings.fontSize || 10.5;
    const margin = settings.margin || 40;
    const photoSize = settings.photoSize || 80;
    const spacing = settings.spacing ?? 4;

    // Derived configurations
    const lineHeight = settings.lineHeight || 1.15;
    const ptLeftRight = settings.leftRightMargin ?? margin;
    const ptTopBottom = settings.topBottomMargin ?? margin;
    const spaceBeforeEntries = settings.spaceBeforeEntries ?? 4;

    const hAlign = settings.headerAlign === 'center' ? 'center' : settings.headerAlign === 'right' ? 'flex-end' : 'flex-start';
    const tAlign = settings.headerAlign === 'center' ? 'center' : settings.headerAlign === 'right' ? 'right' : 'left';

    const isExtended = settings.headerArrangement === 'extended';
    const isCompact = settings.headerArrangement === 'compact';

    return StyleSheet.create({
        page: {
            paddingTop: ptTopBottom,
            paddingLeft: ptLeftRight,
            paddingRight: ptLeftRight,
            paddingBottom: ptTopBottom,
            backgroundColor: '#FFFFFF',
            color: '#111827',
            lineHeight: lineHeight,
        },
        header: {
            flexDirection: isExtended ? 'column' : 'row',
            alignItems: isExtended ? hAlign : (hAlign === 'flex-start' ? 'flex-start' : 'center'),
            marginBottom: spacing * (isCompact ? 1 : 1.5),
        },
        headerLeft: {
            flexGrow: 1,
            alignItems: hAlign,
            textAlign: tAlign,
            width: isExtended ? '100%' : 'auto',
        },
        name: {
            fontSize: fontSize * (settings.nameSize === 'XS' ? 1.5 : settings.nameSize === 'S' ? 2 : settings.nameSize === 'L' ? 3 : settings.nameSize === 'XL' ? 3.5 : 2.5),
            fontWeight: settings.nameBold !== false ? 'black' : 'normal',
            fontFamily: settings.nameFont === 'creative' ? 'Merriweather' : undefined,
            marginBottom: isCompact ? 1 : 2,
            color: '#111827',
            lineHeight: 1.1,
            textAlign: tAlign,
        },
        title: {
            fontSize: fontSize * 1.4,
            fontWeight: 500,
            fontStyle: settings.titleStyle === 'italic' ? 'italic' : 'normal',
            color: '#374151',
            marginBottom: spacing * 0.5,
            textAlign: tAlign,
        },
        contactInfo: {
            flexDirection: settings.personalDetailsLayout === 'compact' ? 'row' : settings.personalDetailsLayout === 'inline' ? 'row' : 'column',
            flexWrap: 'wrap',
            justifyContent: settings.personalDetailsLayout === 'inline' || settings.personalDetailsLayout === 'compact' ? (hAlign === 'center' ? 'center' : hAlign === 'flex-end' ? 'flex-end' : 'flex-start') : hAlign,
            alignItems: settings.personalDetailsLayout === 'separated' ? hAlign : 'center',
            fontSize: fontSize * 0.9,
            color: '#4b5563',
            marginBottom: settings.personalDetailsLayout === 'separated' ? spacing * 0.5 : spacing * 0.25,
            gap: settings.personalDetailsLayout === 'separated' ? 3 : 6,
            lineHeight: 1.4,
        },
        links: {
            flexDirection: settings.personalDetailsLayout === 'separated' ? 'column' : 'row',
            flexWrap: 'wrap',
            justifyContent: settings.personalDetailsLayout === 'inline' || settings.personalDetailsLayout === 'compact' ? (hAlign === 'center' ? 'center' : hAlign === 'flex-end' ? 'flex-end' : 'flex-start') : hAlign,
            alignItems: settings.personalDetailsLayout === 'separated' ? hAlign : 'center',
            fontSize: fontSize * 0.85,
            gap: settings.personalDetailsLayout === 'separated' ? 3 : 6,
            marginTop: settings.personalDetailsLayout === 'compact' ? spacing * 0.25 : spacing * 0.25,
            lineHeight: 1.4,
        },
        link: {
            color: '#4338ca',
            textDecoration: 'none',
            fontWeight: 500,
        },
        photoContainer: {
            width: photoSize,
            height: photoSize,
            maxWidth: photoSize,
            borderRadius: settings.photoShape === 'circle' ? 999 : settings.photoShape === 'rounded' ? 24 : settings.photoShape === 'squircle' ? 12 : undefined,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            overflow: 'hidden',
            marginLeft: isExtended ? 0 : 15,
            marginTop: isExtended ? 15 : 0,
            alignSelf: isExtended ? hAlign : 'center',
            opacity: settings.photoGrayscale ? 0.85 : 1, // pseudo-grayscale
        },
        photo: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
        section: {
            marginTop: spacing * 1.5,
            marginBottom: spacing * 0.5,
        },
        sectionHeaderContainer: {
            marginBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottom: settings.sectionHeadingStyle === 'underline' ? '1.5pt solid #111827' : undefined,
            borderTop: settings.sectionHeadingStyle === 'topline' || settings.sectionHeadingStyle === 'double' ? '1.5pt solid #111827' : undefined,
            borderRight: settings.sectionHeadingStyle === 'box' ? '1.5pt solid #111827' : undefined,
            borderLeft: settings.sectionHeadingStyle === 'box' || settings.sectionHeadingStyle === 'sideline' ? '1.5pt solid #111827' : undefined,
            paddingBottom: settings.sectionHeadingStyle === 'underline' ? 2 : settings.sectionHeadingStyle === 'box' ? 4 : 0,
            paddingTop: settings.sectionHeadingStyle === 'topline' || settings.sectionHeadingStyle === 'box' || settings.sectionHeadingStyle === 'double' ? 4 : 0,
            paddingLeft: settings.sectionHeadingStyle === 'box' || settings.sectionHeadingStyle === 'sideline' || settings.sectionHeadingStyle === 'shaded' ? 6 : 0,
            paddingRight: settings.sectionHeadingStyle === 'box' || settings.sectionHeadingStyle === 'shaded' ? 6 : 0,
            backgroundColor: settings.sectionHeadingStyle === 'shaded' ? '#f3f4f6' : 'transparent',
        },
        sectionHeader: {
            fontSize: fontSize * (settings.sectionHeadingSize === 'S' ? 1.05 : settings.sectionHeadingSize === 'M' ? 1.2 : settings.sectionHeadingSize === 'L' ? 1.4 : settings.sectionHeadingSize === 'XL' ? 1.6 : 1.1),
            fontWeight: 'bold',
            textTransform: settings.sectionHeadingCapitalization === 'capitalize' ? 'capitalize' : 'uppercase',
            color: '#111827',
            lineHeight: 1.2,
            borderBottom: settings.sectionHeadingStyle === 'wrap' ? '1.5pt solid #111827' : undefined,
            paddingBottom: settings.sectionHeadingStyle === 'wrap' ? 2 : 0,
        },
        sectionIcon: {
            marginRight: 6,
            fontSize: fontSize * 1.2,
        },
        summary: {
            fontSize: fontSize,
            lineHeight: lineHeight,
            textAlign: 'justify',
            marginLeft: settings.indentBody ? 8 : 0,
        },
        skillRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            fontSize: fontSize * 0.95,
            lineHeight: lineHeight,
            marginBottom: settings.skillsStyle === 'compact' ? 0 : spacing * 0.5,
        },
        skillCategory: {
            fontWeight: 'bold',
            width: 120,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spaceBeforeEntries,
            marginBottom: 0,
        },
        itemTitle: {
            fontSize: fontSize * (settings.titleSize === 'S' ? 1.05 : settings.titleSize === 'M' ? 1.2 : settings.titleSize === 'L' ? 1.35 : 1.1),
            fontWeight: 'bold',
        },
        itemRole: {
            fontSize: fontSize,
            color: '#374151',
            fontWeight: settings.subtitleStyle === 'bold' ? 'bold' : 'normal',
            fontStyle: settings.subtitleStyle === 'italic' ? 'italic' : 'normal',
        },
        itemDate: {
            fontSize: fontSize * 0.9,
            fontWeight: 'bold',
            color: '#4b5563',
        },
        bulletList: {
            marginLeft: settings.indentBody ? 10 : 0,
        },
        bulletItem: {
            flexDirection: 'row',
            fontSize: fontSize * 0.95,
            lineHeight: lineHeight,
            marginBottom: spacing * 0.5,
            textAlign: 'justify',
        },
        bulletPoint: {
            width: 15,
            fontSize: fontSize * (settings.listStyle === 'hyphen' ? 1.0 : 1.1),
        },
        bulletText: {
            flex: 1,
        },
        projectLinks: {
            flexDirection: 'column',
            fontSize: fontSize * 0.95,
            lineHeight: lineHeight,
            gap: 0,
            marginBottom: 0,
            marginLeft: settings.indentBody ? 10 : 0,
        },
    });
};

const ResumePDF = ({ resume }) => {
    const isVisible = (section) => resume.settings.visibleSections[section] !== false;
    const settings = resume.settings;
    const fontMapping = {
        'Calibri': 'Helvetica',
        'Arial': 'Helvetica',
        'Cambria': 'Times-Roman',
        'Serif Pro': 'Source Serif Pro',
        'Inter': 'Inter',
        'Roboto': 'Roboto',
        'Open Sans': 'Open Sans',
        'Lato': 'Lato',
        'Merriweather': 'Merriweather'
    };

    // We add font loading check fallback
    const fontToUse = fontMapping[settings.fontFamily] || 'Source Serif Pro';

    // Re-evaluate styles using the latest settings
    const styles = getStyles(settings);

    const SectionHeader = ({ title, id }) => (
        <View style={styles.sectionHeaderContainer}>
            {settings.sectionHeadingIcons !== 'none' && (
                <Text style={styles.sectionIcon}>{settings.sectionHeadingIcons === 'outline' ? '▢' : '■'}</Text>
            )}
            <Text style={styles.sectionHeader}>{title}</Text>
        </View>
    );

    const renderDescription = (text) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');

        if (lines.length > 1) {
            return (
                <View style={[styles.bulletList, { marginTop: 2 }]}>
                    {lines.map((line, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>{settings.listStyle === 'bullet' ? '•' : '–'}</Text>
                            <Text style={styles.bulletText}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        return <Text style={[styles.summary, { marginTop: 2 }]}>{text.replace(/\*\*(.*?)\*\*/g, '$1')}</Text>;
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.nameTitleRow}>
                    <Text style={styles.name}>{resume.personalInfo.name || 'Your Name'}</Text>
                    {resume.personalInfo.title && (
                        <Text style={settings.titlePosition === 'sameLine' ? styles.titleSameLine : styles.title}>
                            {settings.titlePosition === 'sameLine' && settings.headerAlign !== 'right' ? ' | ' : ''}
                            {resume.personalInfo.title}
                        </Text>
                    )}
                </View>

                <View style={styles.contactInfo}>
                    {resume.personalInfo.email && <Text>{resume.personalInfo.email}</Text>}
                    {resume.personalInfo.phone && <Text>{settings.personalDetailsLayout !== 'separated' ? ' • ' : ''}{resume.personalInfo.phone}</Text>}
                    {resume.personalInfo.location && <Text>{settings.personalDetailsLayout !== 'separated' ? ' • ' : ''}{resume.personalInfo.location}</Text>}
                    {resume.personalInfo.availability && <Text>{settings.personalDetailsLayout !== 'separated' ? ' • ' : ''}{resume.personalInfo.availability}</Text>}
                </View>

                {(resume.personalInfo.linkedin || resume.personalInfo.github || resume.personalInfo.portfolio) && (
                    <View style={styles.links}>
                        {resume.personalInfo.portfolio && (
                            <Link src={resume.personalInfo.portfolio} style={styles.link}>
                                Portfolio: {resume.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                            </Link>
                        )}
                        {resume.personalInfo.linkedin && (
                            <Link src={resume.personalInfo.linkedin} style={styles.link}>
                                LinkedIn: {resume.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                            </Link>
                        )}
                        {resume.personalInfo.github && (
                            <Link src={resume.personalInfo.github} style={styles.link}>
                                GitHub: {resume.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                            </Link>
                        )}
                    </View>
                )}
            </View>

            {settings.showPhoto !== false && resume.personalInfo.photo && (
                <View style={styles.photoContainer}>
                    <Image src={resume.personalInfo.photo} style={styles.photo} />
                </View>
            )}
        </View>
    );

    const renderSkills = () => {
        if (!isVisible('skills') || !Object.values(resume.skills).some(s => s.length > 0)) return null;

        let style = settings.skillsStyle || 'bullet';
        if (!['none', 'bullet', 'hyphen'].includes(style)) style = 'bullet';
        const fontSize = settings.fontSize || 10.5;

        return (
            <View wrap={false} style={styles.section}>
                <SectionHeader title="Core Skills" id="skills" />

                {style === 'compact' ? (
                    <Text style={{ fontSize: fontSize * 0.95, lineHeight: settings.lineHeight || 1.15, marginLeft: settings.indentBody ? 8 : 0 }}>
                        {Object.entries(resume.skills).filter(([_, s]) => s.length > 0).map(([k, s]) => s.join(', ')).join(', ')}
                    </Text>
                ) : style === 'newLine' ? (
                    <View style={{ marginLeft: settings.indentBody ? 8 : 0 }}>
                        {Object.entries(resume.skills).filter(([_, s]) => s.length > 0).map(([key, skills]) => (
                            <View key={key} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                <Text style={{ fontWeight: 'bold', width: 120, fontSize: fontSize * 0.95 }}>{key === 'apiSecurity' ? 'APIs & Security' : key === 'devops' ? 'DevOps' : key === 'tools' ? 'Tools & Practices' : key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                                <Text style={{ flex: 1, fontSize: fontSize * 0.95 }}>{skills.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                ) : style === 'pipe' ? (
                    <View style={{ marginLeft: settings.indentBody ? 8 : 0 }}>
                        {Object.entries(resume.skills).filter(([_, s]) => s.length > 0).map(([key, skills]) => (
                            <View key={key} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                <Text style={{ fontWeight: 'bold', width: 120, fontSize: fontSize * 0.95 }}>{key === 'apiSecurity' ? 'APIs & Security' : key === 'devops' ? 'DevOps' : key === 'tools' ? 'Tools & Practices' : key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                                <Text style={{ flex: 1, fontSize: fontSize * 0.95 }}>{skills.join(' | ')}</Text>
                            </View>
                        ))}
                    </View>
                ) : style === 'bullet' || style === 'hyphen' || style === 'none' ? (
                    <View style={[styles.bulletList, { marginTop: 2, marginLeft: settings.indentBody ? 8 : 0 }]}>
                        {Object.entries(resume.skills).filter(([_, s]) => s.length > 0).map(([key, skills]) => (
                            <View key={key} style={styles.bulletItem}>
                                {style !== 'none' && (
                                    <Text style={styles.bulletPoint}>{style === 'bullet' ? '•' : '–'}</Text>
                                )}
                                <Text style={styles.bulletText}>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {key === 'apiSecurity' ? 'APIs & Security' : key === 'devops' ? 'DevOps' : key === 'tools' ? 'Tools & Practices' : key.charAt(0).toUpperCase() + key.slice(1)}:
                                    </Text>
                                    {' ' + skills.join(', ')}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    // Default / Grid
                    <View style={{ marginLeft: settings.indentBody ? 8 : 0 }}>
                        {Object.entries(resume.skills).filter(([_, s]) => s.length > 0).map(([key, skills]) => (
                            <View key={key} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                <Text style={{ fontWeight: 'bold', width: 120, fontSize: fontSize * 0.95 }}>{key === 'apiSecurity' ? 'APIs & Security' : key === 'devops' ? 'DevOps' : key === 'tools' ? 'Tools & Practices' : key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                                <Text style={{ flex: 1, fontSize: fontSize * 0.95 }}>{skills.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const sectionRenderers = {
        summary: () => isVisible('summary') && resume.personalInfo.summary ? (
            <View wrap={false} style={styles.section}>
                <SectionHeader title="Professional Summary" id="summary" />
                {renderDescription(resume.personalInfo.summary)}
            </View>
        ) : null,

        skills: renderSkills,

        experience: () => isVisible('experience') && resume.experience.length > 0 ? (
            <View style={styles.section}>
                <SectionHeader title="Professional Experience" id="experience" />
                {resume.experience.map((exp, idx) => (
                    <View key={idx} wrap={false}>
                        <View style={styles.itemHeader}>
                            <View style={{ flexDirection: settings.subtitlePlacement === 'next' ? 'column' : 'row', flex: 1, flexWrap: 'wrap' }}>
                                <Text style={styles.itemTitle}>{exp.company}</Text>
                                {exp.role && (
                                    <Text style={[styles.itemRole, settings.subtitlePlacement === 'same' ? { marginLeft: 4 } : { marginTop: 2, marginBottom: 2 }]}>
                                        {settings.subtitlePlacement === 'same' ? `- ${exp.role}` : exp.role}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.itemDate}>{exp.date}</Text>
                        </View>
                        {renderDescription(exp.description)}
                    </View>
                ))}
            </View>
        ) : null,

        projects: () => isVisible('projects') && resume.projects.length > 0 ? (
            <View style={styles.section}>
                <SectionHeader title="Personal Projects" id="projects" />
                {resume.projects.map((proj, idx) => (
                    <View key={idx} wrap={false}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>{proj.name}</Text>
                        </View>
                        <View style={styles.projectLinks}>
                            {proj.github && <Link src={proj.github} style={styles.link}>GitHub: {proj.github.replace(/^https?:\/\/(www\.)?/, '')}</Link>}
                            {proj.frontend && <Link src={proj.frontend} style={styles.link}>Frontend: {proj.frontend.replace(/^https?:\/\/(www\.)?/, '')}</Link>}
                            {proj.backend && <Link src={proj.backend} style={styles.link}>Backend: {proj.backend.replace(/^https?:\/\/(www\.)?/, '')}</Link>}
                        </View>
                        {renderDescription(proj.description)}
                    </View>
                ))}
            </View>
        ) : null,

        education: () => isVisible('education') && resume.education.length > 0 ? (
            <View style={styles.section}>
                <SectionHeader title="Education" id="education" />
                {resume.education.map((edu, idx) => (
                    <View key={idx} wrap={false}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>{edu.degree}, {edu.school}</Text>
                            <Text style={styles.itemDate}>{edu.date} {edu.location ? `| ${edu.location}` : ''}</Text>
                        </View>
                        {edu.cgpa && <Text style={{ fontSize: (settings.fontSize || 10.5) * 0.85, color: '#4b5563', marginTop: 1, marginLeft: settings.indentBody ? 10 : 0 }}>CGPA: {edu.cgpa}</Text>}
                    </View>
                ))}
            </View>
        ) : null,

        certifications: () => isVisible('certifications') && resume.certifications.length > 0 ? (
            <View style={styles.section}>
                <SectionHeader title="Training & Certifications" id="certifications" />
                <View style={styles.bulletList}>
                    {resume.certifications.map((cert, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>{settings.listStyle === 'bullet' ? '•' : '–'}</Text>
                            <Text style={styles.bulletText}>{cert.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        ) : null,
    };

    const fixedSectionOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];

    return (
        <Document title={`${resume.personalInfo.name || 'Resume'}_Optimized`}>
            <Page size="A4" style={[styles.page, { fontFamily: fontToUse }]}>
                {renderHeader()}
                {fixedSectionOrder.map(section => (
                    <React.Fragment key={`pdf-section-${section}`}>
                        {sectionRenderers[section] ? sectionRenderers[section]() : null}
                    </React.Fragment>
                ))}
            </Page>
        </Document>
    );
};

export default ResumePDF;
