import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelEventReminder } from '../../utils/notifications';

type EventItem = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    location: string;
    description: string;
    startTimestamp: number;
    monthKey: string;
};

type EventSection = {
    title: string;
    data: EventItem[];
};

export default function Saved() {
    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [reminderKeyMapping, setReminderKeyMapping] = useState<{ [eventId: string]: string }>({});

    const API_KEY = "AIzaSyBIx6nTl2niOG6yD17L-jua2X-u-j2mFBU";
    const CALENDAR_ID = "5e9e02620498aabb88e980ffffc9e742bc348d9556cd358f836f75398a4d9f35@group.calendar.google.com";

    const fetchSavedEvents = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        setError(null);

        try {
            // 1. Get all saved reminder IDs from AsyncStorage
            const allKeys = await AsyncStorage.getAllKeys();
            const reminderKeys = allKeys.filter(key => key.startsWith('reminder_'));

            // If nothing is saved, we don't need to hit the API
            if (reminderKeys.length === 0) {
                setSavedEvents([]);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Extract the actual event IDs from the keys (e.g., "reminder_123" -> "123")
            const savedEventIds = reminderKeys.map(key => key.replace('reminder_', ''));

            // Create a mapping from eventId -> reminderId (for canceling the notification later)
            const newMapping: { [eventId: string]: string } = {};
            for (const key of reminderKeys) {
                const eventId = key.replace('reminder_', '');
                const reminderId = await AsyncStorage.getItem(key);
                if (reminderId) {
                    newMapping[eventId] = reminderId;
                }
            }
            setReminderKeyMapping(newMapping);

            // 2. Fetch all events from Google Calendar
            const apiURL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true`;
            const response = await fetch(apiURL);
            const json = await response.json();

            if (json.error) {
                setError(json.error.message || "Failed to load events from Google Calendar.");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const items = json.items || [];

            // 3. Filter and parse the API data to ONLY include the user's saved events
            const mappedData = items
                .filter((item: any) => savedEventIds.includes(item.id))
                .map((item: any) => {
                    if (!item.start) return null;

                    const start = item.start.dateTime || item.start.date;
                    const end = item.end?.dateTime || item.end?.date;
                    const dateObj = new Date(start);
                    const endDateObj = end ? new Date(end) : null;
                    const hasRealEndTime = endDateObj && endDateObj.getTime() !== dateObj.getTime();

                    const isAllDay = !!item.start.date;
                    const startTimeStr = isAllDay
                        ? "All Day"
                        : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    const endTimeStr = isAllDay || !hasRealEndTime
                        ? ""
                        : endDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                    const dateString = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    const monthKey = dateObj.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });

                    // Strip HTML (Simple regex implementation to avoid needing a separate file utility)
                    const cleanDescription = (item.description || "")
                        .replace(/<[^>]*>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, '&')
                        .trim();

                    return {
                        id: item.id,
                        title: item.summary || "No Title",
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        date: dateString,
                        location: item.location || "TBD",
                        description: cleanDescription,
                        startTimestamp: dateObj.getTime(),
                        monthKey: monthKey,
                    };
                }).filter(Boolean);

            setSavedEvents(mappedData);
        } catch (err) {
            console.error(err);
            setError("Unable to load saved events right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refetch the data every time this tab is focused
    // so if they just saved something in the Details screen, it updates here immediately
    useFocusEffect(
        useCallback(() => {
            fetchSavedEvents();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedEvents(true);
    };

    const handleRemoveSavedEvent = async (eventId: string) => {
        Alert.alert(
            "Remove Saved Event",
            "Are you sure you want to remove this event from your saved list? You will no longer receive a reminder.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const storageKey = `reminder_${eventId}`;
                            const reminderId = reminderKeyMapping[eventId];

                            // 1. Cancel the scheduled notification if we have the ID
                            if (reminderId) {
                                await cancelEventReminder(reminderId);
                            }

                            // 2. Remove it from disk
                            await AsyncStorage.removeItem(storageKey);

                            // 3. Immediately remove it from the UI so we don't need to refetch
                            setSavedEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));

                            // 4. Update the dictionary mapping to keep it clean
                            setReminderKeyMapping(prev => {
                                const newMap = { ...prev };
                                delete newMap[eventId];
                                return newMap;
                            });

                        } catch (err) {
                            console.error("Error removing saved event", err);
                            Alert.alert("Error", "Could not remove the event. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    // Grouping by Month for the SectionList
    const groupByMonth = (events: EventItem[]): EventSection[] => {
        const grouped: { [key: string]: EventItem[] } = {};
        events.forEach(event => {
            if (!grouped[event.monthKey]) {
                grouped[event.monthKey] = [];
            }
            grouped[event.monthKey].push(event);
        });

        const monthOrder: string[] = [];
        events.forEach(event => {
            if (!monthOrder.includes(event.monthKey)) monthOrder.push(event.monthKey);
        });

        return monthOrder.map(month => ({
            title: month,
            data: grouped[month],
        }));
    };

    const sections = groupByMonth(savedEvents.sort((a, b) => a.startTimestamp - b.startTimestamp));

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D25100" />
                    <Text style={styles.loadingText}>Loading saved events...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#D25100" />
                    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchSavedEvents()}>
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (savedEvents.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Saved Events</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="bookmark-outline" size={80} color="#999" />
                    <Text style={styles.emptyTitle}>No Saved Events</Text>
                    <Text style={styles.emptyMessage}>
                        You haven't requested any reminders for upcoming events yet. Tap the bell icon on an event to save it here!
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Saved Events</Text>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D25100" />
                }
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{section.title}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => {
                            router.push({
                                pathname: "/details/[id]",
                                params: {
                                    id: item.id,
                                    title: item.title,
                                    startTime: item.startTime,
                                    endTime: item.endTime,
                                    date: item.date,
                                    location: item.location,
                                    description: item.description,
                                    startTimestamp: item.startTimestamp,
                                }
                            });
                        }}
                    >
                        <View style={styles.row}>
                            <View style={styles.timeContainer}>
                                <Text style={styles.startTime}>{item.startTime}</Text>
                                {item.endTime ? <Text style={styles.endTime}>to {item.endTime}</Text> : null}
                                <Text style={styles.date}>{item.date}</Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveSavedEvent(item.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={22} color="#D25100" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                stickySectionHeadersEnabled={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 15 },
    headerContainer: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#002649',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
  backgroundColor: '#F1F6FA',
  padding: 20,
  borderRadius: 20,
  marginBottom: 16,
  shadowColor: '#002649',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
  borderWidth: 1,
  borderColor: '#DCE7F0',
},
    row: { flexDirection: 'row', alignItems: 'center' },
    timeContainer: {
        minWidth: 80,
        marginRight: 16,
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        alignItems: 'flex-start',
    },
    startTime: { fontWeight: '800', color: '#D25100', fontSize: 15 },
    endTime: { color: '#D25100', fontSize: 10, marginTop: 2, opacity: 0.85 },
    date: { color: '#666', fontSize: 11, marginTop: 4 },
    info: { flex: 1, justifyContent: 'center' },
    title: { fontWeight: '700', fontSize: 17, color: '#002649', marginBottom: 4 },
    location: { color: '#666', fontSize: 13, marginTop: 4 },
    listContent: { paddingBottom: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    errorTitle: { marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#333' },
    errorMessage: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
    retryButton: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D25100',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8 },
    emptyTitle: { marginTop: 16, fontSize: 20, fontWeight: 'bold', color: '#333' },
    emptyMessage: { marginTop: 8, fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
    sectionHeader: { paddingVertical: 12, marginBottom: 8 },
    sectionHeaderText: { fontSize: 18, fontWeight: '800', color: '#002649', textTransform: 'uppercase', letterSpacing: 1 },
    removeButton: {
        marginLeft: 10,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
