// Import necessary React and React Native components
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Import FontAwesome icons from Expo vector icons library
import { FontAwesome5 } from '@expo/vector-icons';

// Define the structure for each pillar item
type PillarItem = {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
}

export default function Index() {
  // Data array containing all 6 pillars with their respective icons and descriptions
  const pillars: PillarItem[] = [
    // TODO: Populate this array with the 6 pillars data.
    // Difficulty: Easy
    // Instructions: Add objects with id, icon, color, title, and description for each pillar.
    {
      id: "academic",
      icon: "graduation-cap",
      color: "#FF7A3C",
      title: "Academic Development",
      description: "Supporting students with resources and metorship to excel academically.",
    },
    {
      id: "career",
      icon: "briefcase",
      color: "#004AAD",
      title: "Career Development",
      description: "Building community and inclusivity through events that strengthen chapter culture.",
    },
    {
      id: "community",
      icon: "hands-helping",
      color: "#1FAA59",
      title: "Community Outreach",
      description: "Giving back to El Paso through volunteering and STEM education initiatives.",
    },
    {
      id: "leadership",
      icon: "calendar-check",
      color: "#FF7A3C",
      title: "Leadership Development",
      description: "Providing opportunities for members to grow into confident, capable leaders.",
    },
    {
      id: "professional",
      icon: "user-tie",
      color: "#004AAD",
      title: "Professional Development",
      description: "Connecting students to industry professionals and career resources."
    },
    {
      id: "technical",
      icon: "laptop-code",
      color: "#1FAA59",
      title: "Technical Development",
      description: "Cultivating technical skills through workships, coding projects, and innovation labs.",
    }
  ];

  return (
    // SafeAreaView ensures content doesn't overlap with device notches/status bars
    <SafeAreaView style={styles.container}>
      {/* ScrollView allows the content to be scrollable */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER SECTION - Logo and Organization Name */}
        {/* TODO: Create Header Section with Logo and University Name. */}
        {/* Difficulty: Easy */}
        {/* Instructions: Use Image component for logo and Text for university name. ** look in the assets folder */}
        <View style={styles.headerSection}>
        </View>

        {/* MISSION SECTION */}
        {/* TODO: Create Mission Section. */}
        {/* Difficulty: Easy */}
        {/* Instructions: Add a section header with icon and title, and body text for the mission. */}
        <View style={styles.textSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="bullseye" size={20} color="#0477e3ff" solid />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.bodyText}>Engage UTEP and El Paso students through academic, 
            leadeership, professional, and service opportunities in support of their growth opportunities 
            in support of their growth as STEM professionals.
          </Text>
        </View>

        {/* VISION SECTION */}
        {/* TODO: Create Vision Section. */}
        {/* Difficulty: Easy */}
        {/* Instructions: Add a section header with icon and title, and body text for the vision. */}
        <View style={styles.textSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="eye" size={20} color="#86DC3D" solid />
            <Text style={styles.sectionTitle}>Our Vision</Text>
          </View>
          <Text style={styles.bodyText}>To be the model organization that develops socially responsible STEM 
            professionals who make a lasting STEM professionals who
            make a lasting impact and serve as role models within their communities.
          </Text>
        </View>

        {/* 6 PILLARS SECTION HEADER */}
        {/* TODO: Create Pillars Header. */}
        {/* Difficulty: Easy */}
        <View style={styles.pillarsHeaderContainer}>
          <Text style={styles.pillarsHeader}>Our 6 Pillars</Text>
        </View>

        {/* Map through each pillar and render individual cards */}
        {/* TODO: Create Pillars Section. Map through the pillars array. */}
        {/* Difficulty: Medium */}
        {/* Instructions: Use pillars.map() to render a View for each pillar. Display icon, title, and description. */}
        {pillars.map((pillar) => (
          <View key={pillar.id} style={styles.pillarSection}>
            <View style={styles.pillarCard}>
              <View style={[styles.iconContainer, {backgroundColor: pillar.color}]}>
                <FontAwesome5
                  name = {pillar.icon as any}
                  size = {24}
                  color = "#FFFFFF"
                  solid
                  />
              </View>
              <View style = {styles.pillarContent}>
                <Text style = {styles.pillarTitle}>{pillar.title}</Text>
                <Text style = {styles.pillarDescription}>{pillar.description}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* CONTRIBUTORS SECTION - Small, subtle section showing app contributors */}
        <View style={styles.contributorsSection}>
          <Text style={styles.contributorsTitle}>Contributors</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contributorsRow}
          >
            {/* Placeholder contributors - replace names when available */}
            {['JD', 'MC', 'AR', 'LS', 'KP', 'TR', 'MG', 'DS', 'CH', 'NR'].map((initials, index) => (
              <View key={index} style={styles.contributorAvatar}>
                <Text style={styles.contributorInitials}>{initials}</Text>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.contributorsSubtitle}>Thank you to everyone who made this app possible</Text>
        </View>

        {/* FOOTER SECTION - Organization tagline */}
        {/* TODO: Create Footer with Social Icons. */}
        {/* Difficulty: Easy */}
        {/* Instructions: Add footer title, subtitle, and social media icons. */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>SHPE/MAES</Text>
          <Text style={styles.footerSubtitle}>Leading Hispanics In STEM at the University of Texas at El Paso</Text>
          {/* TODO: Uncomment and add proper imports for TouchableOpacity and Ionicons */}
          {/* <TouchableOpacity style = {styles.socialContainer}>
          <a href="https://facebook.com/utepmaesshpe" target="_blank">
            <Ionicons style = {styles.socialIcon} name='logo-facebook'/>
          </a>
          <a href="https://www.instagram.com/utepshpemaes" target="_blank">
            <Ionicons style = {styles.socialIcon} name='logo-instagram'/>
          </a>
          <a href="https://www.linkedin.com/company/utep-shpe-maes-engineering" target="_blank">
            <Ionicons style = {styles.socialIcon} name='logo-linkedin'/>
          </a>
          </TouchableOpacity> */}
    
        </View>

        {/* BOTTOM TAB BAR SPACER */}
        <View style={styles.bottomSpacer} />

      </ScrollView>
    </SafeAreaView>
  );
}

// Stylesheet defining all visual styles for the component
const styles = StyleSheet.create({
  // Main container with gradient-like background
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },

  // Header section containing logo and org name
  // BEFORE: backgroundColor: 'linear-gradient(135deg, #E8F4F8 0%, #F0F8E8 100%)',
  // AFTER: Replaced with solid color - linear-gradient is not supported in React Native
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#E8F4F8',
  },

  // Logo image styling
  logo: {
    width: 200,
    height: 100,
    marginBottom: 15,
  },

  // Organization name text
  orgName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002649',
    marginBottom: 5,
  },

  // University name text
  university: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },

  // Generic section container
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Text section without container (for Mission/Vision)
  textSection: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 15,
  },

  // Section header with icon and title
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Section title text
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002649',
    marginLeft: 10,
  },

  // Body text for mission/vision
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },

  // "Our 6 Pillars" header container
  pillarsHeaderContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 5,
  },

  // "Our 6 Pillars" header
  pillarsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002649',
    textAlign: 'center',
  },

  // Individual pillar section (white card container)
  pillarSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Individual pillar card content
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Icon container with colored background
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  // Pillar text content container
  pillarContent: {
    flex: 1,
  },

  // Pillar title
  pillarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002649',
    marginBottom: 4,
  },

  // Pillar description
  pillarDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // Footer section
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },

  // Footer title
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002649',
    marginBottom: 5,
  },

  // Footer subtitle
  footerSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Social media icons container
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Spacing between social icons
  socialIcon: {
    marginLeft: 20,
  },

  // BEFORE: height: 20 (too small for newer iPhones with home indicator)
  // AFTER: Increased for better clearance on all iPhone models
  bottomSpacer: {
    height: 40,
  },

  // Contributors section - subtle, minimal styling
  contributorsSection: {
    marginHorizontal: 15,
    marginTop: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },

  contributorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  contributorsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  // BEFORE: width/height: 36 (slightly small for touch targets if interactive)
  // AFTER: Increased to 40 for better visibility and potential tap target
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },

  contributorInitials: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667788',
  },

  contributorsSubtitle: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
