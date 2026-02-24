import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
// AFTER: Added StyleSheet and SafeAreaView for proper styling
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { cancelEventReminder, registerForPushNotificationsAsync, scheduleEventReminder } from '../../../utils/notifications';

export default function EventDetails() {
    const params = useLocalSearchParams();
    // AFTER: Updated to use startTime/endTime instead of old time param
    const { title, description, startTime, endTime, date, location, startTimestamp } = params;
    const navigation = useNavigation();

    // State to track if a reminder is set for this event
    const [isReminderSet, setIsReminderSet] = useState(false);
    const [reminderId, setReminderId] = useState<string | null>(null);

    // Key for storing reminder ID in AsyncStorage
    const storageKey = `reminder_${params.id}`;

    useEffect(() => {
        navigation.setOptions({ title: params.title });
        checkReminderStatus();
    }, [params.title]);

    // Check if we already have a reminder set for this event
    const checkReminderStatus = async () => {
        try {
            const storedId = await AsyncStorage.getItem(storageKey);
            if (storedId) {
                setIsReminderSet(true);
                setReminderId(storedId);
            }
        } catch (error) {
            console.error("Error reading reminder status", error);
        }
    };

    // Handle toggling the reminder
    const handleReminderToggle = async () => {
        try {
            if (isReminderSet && reminderId) {
                // Cancel existing reminder
                const success = await cancelEventReminder(reminderId);
                if (success) {
                    await AsyncStorage.removeItem(storageKey);
                    setIsReminderSet(false);
                    setReminderId(null);
                    Alert.alert("Reminder Canceled", "You will no longer receive a notification for this event.");
                } else {
                    Alert.alert("Error", "Could not cancel the reminder. Please try again.");
                }
            } else {
                // We need a valid start time to schedule
                if (!startTimestamp) {
                    Alert.alert("Unable to set reminder", "This event does not have a valid start time.");
                    return;
                }

                // Schedule new reminder (1 hour before event)
                const eventDate = new Date(Number(startTimestamp));
                // Subtract 1 hour (60 minutes * 60 seconds * 1000 ms)
                const triggerDate = new Date(eventDate.getTime() - 60 * 60 * 1000);

                // Check if the trigger date is in the past
                if (triggerDate.getTime() < Date.now()) {
                    Alert.alert("Too Late", "This event is too soon or has already passed to set a 1-hour reminder.");
                    return;
                }

                // Request permissions first
                const hasPermission = await registerForPushNotificationsAsync();
                if (!hasPermission) {
                    Alert.alert("Permission Denied", "Please enable notifications in your device settings to use reminders.");
                    return;
                }

                const newReminderId = await scheduleEventReminder(
                    `Upcoming Event: ${title}`,
                    `Starts in 1 hour at ${location || 'TBD'}`,
                    triggerDate,
                    { eventId: params.id }
                );

                if (newReminderId) {
                    await AsyncStorage.setItem(storageKey, newReminderId);
                    setIsReminderSet(true);
                    setReminderId(newReminderId);
                    Alert.alert("Reminder Set!", "You will be notified 1 hour before the event starts.");
                } else {
                    Alert.alert("Error", "Could not schedule the reminder. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error handling reminder", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    // Format the time display - show "startTime to endTime" or just "startTime" if no end
    const formatTimeDisplay = () => {
        if (!startTime) return "Time not specified";
        if (endTime) return `${startTime} to ${endTime}`;
        return String(startTime);
    };

    return (
        // BEFORE: <View> with no styling
        // AFTER: SafeAreaView with proper container styling
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            {/* BEFORE: router.back() was navigating to Home tab instead of Calendar */}
            {/* AFTER: Using router.replace('/calendar') to ensure proper navigation */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/calendar')}>
                <Ionicons name="arrow-back" size={24} color='#002649' />
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

                {/* Remind Me Button */}
                <TouchableOpacity
                    style={[styles.rsvpButton, isReminderSet && styles.rsvpButtonActive]}
                    onPress={handleReminderToggle}
                >
                    <Ionicons
                        name={isReminderSet ? "notifications" : "notifications-outline"}
                        size={20}
                        color={isReminderSet ? "#D25100" : "#FFFFFF"}
                    />
                    <Text style={[styles.rsvpButtonText, isReminderSet && styles.rsvpButtonTextActive]}>
                        {isReminderSet ? "Reminder Set" : "Remind Me 1h Before"}
                    </Text>
                </TouchableOpacity>

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
        backgroundColor: '#F0F4F8',
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
        fontSize: 26,
        fontWeight: '800',
        color: '#002649',
        marginTop: 20,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 14,
        shadowColor: '#002649',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
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
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    descriptionSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
        shadowColor: '#002649',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: '#002649',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
        fontWeight: '400',
    },
    rsvpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D25100',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 20, // Modern pill-shape or squircle
        marginTop: 24,
        minHeight: 56, // Larger touch target
        shadowColor: '#D25100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#D25100',
    },
    rsvpButtonActive: {
        backgroundColor: '#FFFFFF',
    },
    rsvpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    rsvpButtonTextActive: {
        color: '#D25100',
    },
    // BEFORE: height: 30 (too small for newer iPhones with home indicator)
    // AFTER: Increased for better clearance on all iPhone models
    bottomSpacer: {
        height: 40,
    },
});