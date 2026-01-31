import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
// AFTER: Added StyleSheet and SafeAreaView for proper styling
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetails() {
    const params = useLocalSearchParams();
    // AFTER: Updated to use startTime/endTime instead of old time param
    const { title, description, startTime, endTime, date, location } = params;
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({title: params.title});
    }, [params.title]);

    // Format the time display - show "startTime to endTime" or just "startTime" if no end
    const formatTimeDisplay = () => {
        if (!startTime) return "Time not specified";
        if (endTime) return `${startTime} to ${endTime}`;
        return String(startTime);
    };

    return(
        // BEFORE: <View> with no styling
        // AFTER: SafeAreaView with proper container styling
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            {/* BEFORE: router.back() was navigating to Home tab instead of Calendar */}
            {/* AFTER: Using router.replace('/calendar') to ensure proper navigation */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/calendar')}>
                <Ionicons name="arrow-back" size={24} color='#002649'/>
                <Text style={styles.backButtonText}>Back to Calendar</Text>
            </TouchableOpacity>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Event Title */}
                {/* BEFORE: <Text>{title}</Text> - unstyled */}
                {/* AFTER: Properly styled title with fallback */}
                <Text style={styles.title}>{title || "Event Details"}</Text>

                {/* Date and Time Section */}
                {/* BEFORE: Icon was white on white background (invisible) */}
                {/* AFTER: Fixed icon colors and added proper styling */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        {/* BEFORE: <Ionicons name="time-outline" size={16} color="white" /> */}
                        {/* AFTER: Changed color from white to visible orange */}
                        <Ionicons name="calendar-outline" size={20} color="#D25100" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Date & Time</Text>
                        {/* AFTER: Display date and formatted time range */}
                        <Text style={styles.infoValue}>
                            {date ? `${date} • ` : ""}{formatTimeDisplay()}
                        </Text>
                    </View>
                </View>

                {/* Location Section */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="location-outline" size={20} color="#D25100" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Location</Text>
                        {/* AFTER: Added fallback for missing location */}
                        <Text style={styles.infoValue}>{location || "Location TBD"}</Text>
                    </View>
                </View>

                {/* Description Section */}
                {/* BEFORE: Just plain text labels */}
                {/* AFTER: Styled section with header and body */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionHeader}>About this Event</Text>
                    {/* AFTER: Added fallback for missing description */}
                    <Text style={styles.descriptionText}>
                        {description || "No description available for this event."}
                    </Text>
                </View>

                {/* RSVP Button */}
                {/* BEFORE: Unstyled TouchableOpacity with plain text */}
                {/* AFTER: Properly styled button matching app design */}
                {/* <TouchableOpacity style={styles.rsvpButton} onPress={() => alert("RSVP Done!")}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.rsvpButtonText}>RSVP for this Event</Text>
                </TouchableOpacity> */}

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    )
}

// AFTER: Added complete StyleSheet for proper styling
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // BEFORE: paddingVertical: 10 (too small for touch target)
    // AFTER: Increased to 14 for better touch target (minimum 44pt recommended)
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        // AFTER: Added minHeight to ensure adequate touch target
        minHeight: 48,
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#002649',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002649',
        marginTop: 20,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    descriptionSection: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002649',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444',
    },
    // AFTER: Added minHeight for adequate touch target on all devices
    rsvpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D25100',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 20,
        minHeight: 50,
    },
    rsvpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // BEFORE: height: 30 (too small for newer iPhones with home indicator)
    // AFTER: Increased for better clearance on all iPhone models
    bottomSpacer: {
        height: 40,
    },
});