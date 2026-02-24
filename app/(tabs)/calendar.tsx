import { router } from "expo-router";
import { useEffect, useState } from 'react';
// BEFORE: import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// AFTER: Added RefreshControl for pull-to-refresh functionality
// AFTER: Replaced FlatList with SectionList for month-based grouping
// AFTER: Added Dimensions for responsive sizing
import { ActivityIndicator, Dimensions, Image, RefreshControl, SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// AFTER: Added Ionicons import for retry and empty state icons
import { Ionicons } from '@expo/vector-icons';

// AFTER: Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');


// AFTER: Extended EventItem type to include date for better display
type EventItem = {
  id: string;
  title: string;
  // Start time display string (e.g., "02:00 PM" or "All Day")
  startTime: string;
  // End time display string (e.g., "03:30 PM" or empty for all-day)
  endTime: string;
  // AFTER: Added date field to show users which day events occur
  date: string;
  location: string;
  description: string;
  // AFTER: Added startTimestamp for proper date comparison (filtering/sorting)
  startTimestamp: number;
  // AFTER: Added endTimestamp to determine when event is truly over
  endTimestamp: number;
  // AFTER: Added monthKey for grouping events by month (e.g., "January 2026")
  monthKey: string;
}

// AFTER: Define section type for SectionList
type EventSection = {
  title: string;
  data: EventItem[];
  isPastDivider?: boolean; // Special flag for "Past Events" divider section
}

// AFTER: Helper function to strip HTML tags from description
// Google Calendar API returns HTML-formatted descriptions
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags using regex
  return html
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/&nbsp;/g, ' ')           // Replace &nbsp; with space
    .replace(/&amp;/g, '&')            // Replace &amp; with &
    .replace(/&lt;/g, '<')             // Replace &lt; with <
    .replace(/&gt;/g, '>')             // Replace &gt; with >
    .replace(/&quot;/g, '"')           // Replace &quot; with "
    .replace(/&#39;/g, "'")            // Replace &#39; with '
    .replace(/\s+/g, ' ')              // Collapse multiple spaces
    .trim();                           // Trim whitespace
};

// BEFORE: export default function Index() {
// AFTER: Renamed to Calendar for clarity - function name should match file purpose
export default function Calendar() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<EventItem[]>([]);
  // AFTER: Added error state to track API failures and show user-friendly error UI
  const [error, setError] = useState<string | null>(null);
  // AFTER: Added refreshing state for pull-to-refresh indicator
  const [refreshing, setRefreshing] = useState(false);
  // AFTER: Added showPastEvents toggle (default: false - only show upcoming)
  const [showPastEvents, setShowPastEvents] = useState(false);
  // AFTER: Added currentTime state to force re-render for real-time event filtering
  const [currentTime, setCurrentTime] = useState(Date.now());

  // AFTER: Extracted fetch logic into a reusable function for retry functionality
  // BEFORE: const fetchEvents = () => {
  // AFTER: Added isRefresh parameter to distinguish initial load from pull-to-refresh
  const fetchEvents = (isRefresh = false) => {
    // Reset states before fetching
    // BEFORE: setLoading(true);
    // AFTER: Only show loading spinner on initial load, not on refresh
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    // ========================================
    // OLD IMPLEMENTATION - STATIC JSON FILE
    // ========================================
    // This was the previous version that fetched events from a static JSON file hosted on GitHub Gist
    // Uncomment this section and comment out the Google Calendar API section below to revert to the old implementation
    /*
    const apiURL = "https://gist.githubusercontent.com/adhfmz8/acd73178db29e288191901a7dd380872/raw/77450dd827c793917a5ac9cad037db866ad4f481/data.json"

    fetch(apiURL)
    .then((response)=> response.json())
    .then((json) => {
      setData(json);  // Directly set the JSON data (no transformation needed)
      setLoading(false);
    })
    .catch((error) => console.error(error));
    */
    // ========================================
    // END OF OLD IMPLEMENTATION
    // ========================================

    // ========================================
    // NEW IMPLEMENTATION - GOOGLE CALENDAR API
    // ========================================
    // This is the new version that fetches real-time events from Google Calendar
    // Comment out this entire section and uncomment the old implementation above to revert

    // ========================================
    // GOOGLE CALENDAR API CONFIGURATION
    // ========================================
    // API Key: Used to authenticate requests to Google Calendar API
    // IMPORTANT: For production apps, consider using environment variables
    // and restricting this API key in Google Cloud Console to prevent unauthorized use
    // This is the API key for the real Google Calendar API
    //const API_KEY = "AIzaSyDe3pSzYXT0tMWFrl3q40lWur1Lls-MEZQ"; 

    // This is the API key for the Google Calendar API
    


    // Calendar ID: Unique identifier for the specific Google Calendar we want to fetch events from
    // This is typically found in the calendar settings under "Integrate calendar"
    // This is the Calendar ID for the real Google Calendar
    //const CALENDAR_ID = "shpemaesutep@gmail.com";

    // This is the Calendar ID for the mock Google Calendar

    // ========================================
    // BUILD API REQUEST URL
    // ========================================
    // Construct the Google Calendar API endpoint with query parameters:
    // - encodeURIComponent(CALENDAR_ID): Safely encode the calendar ID for use in URL
    // - key=${API_KEY}: Authentication parameter
    // - orderBy=startTime: Sort events chronologically by their start time
    // - singleEvents=true: Expand recurring events into individual instances
    const apiURL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true`;
    console.log(apiURL);

    // FETCH EVENTS FROM GOOGLE CALENDAR
    // ========================================
    fetch(apiURL)
      .then((response) => response.json())
      .then((json) => {
        // ========================================
        // ERROR HANDLING
        // ========================================
        // Check if the API returned an error (e.g., invalid API key, calendar not found, permission denied)
        if (json.error) {
          console.error("Google Calendar API Error:", json.error);
          // AFTER: Set user-friendly error message instead of just logging
          setError(json.error.message || "Failed to load events from Google Calendar");
          setLoading(false);
          return;
        }

        // ========================================
        // EXTRACT EVENTS FROM RESPONSE
        // ========================================
        // The Google Calendar API returns events in a 'items' array
        // If no events exist, default to an empty array to prevent errors
        const items = json.items || [];

        // ========================================
        // TRANSFORM GOOGLE CALENDAR DATA
        // ========================================
        // Map each Google Calendar event to our app's EventItem structure
        // This ensures compatibility with our existing UI components
        // NOTE: The old JSON implementation didn't need this transformation because the data was already in the correct format
        const mappedData = items.map((item: any) => {
          // AFTER: Added null check for item.start to prevent crashes on malformed data
          if (!item.start) {
            console.warn("Event missing start time:", item);
            return null;
          }

          // Extract the start time/date from the event
          // dateTime: Used for events with specific times (e.g., "2025-12-15T14:00:00-07:00")
          // date: Used for all-day events (e.g., "2025-12-15")
          const start = item.start.dateTime || item.start.date;
          const end = item.end?.dateTime || item.end?.date;

          // Convert the ISO 8601 date string to a JavaScript Date object
          // This allows us to format the time according to our needs
          const dateObj = new Date(start);
          const endDateObj = end ? new Date(end) : null;

          // Check if we have a real end time (different from start)
          const hasRealEndTime = endDateObj && endDateObj.getTime() !== dateObj.getTime();

          // For past events logic: if no end time, assume 1 hour after start
          const endTimestampForFiltering = hasRealEndTime
            ? endDateObj.getTime()
            : dateObj.getTime() + (60 * 60 * 1000); // 1 hour in milliseconds

          // ========================================
          // FORMAT TIME STRINGS
          // ========================================
          // Check if this is an all-day event (only has 'date', no 'dateTime')
          // - All-day events: Display "All Day" for start, empty for end
          // - Timed events: Show end time only if explicitly provided
          const isAllDay = !!item.start.date;
          const startTimeStr = isAllDay
            ? "All Day"
            : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          // Only show end time if it's a real end time (not same as start, not assumed)
          const endTimeStr = isAllDay || !hasRealEndTime
            ? ""
            : endDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          // BEFORE: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          // This produced "Thu, Jan 23" which was cramped
          // AFTER: Shortened format without weekday for cleaner display
          const dateString = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });

          // ========================================
          // CREATE EVENT ITEM OBJECT
          // ========================================
          // Map Google Calendar fields to our EventItem type:
          // OLD JSON had: id, title, time, location, description (already in correct format)
          // NEW API uses: id, summary, start.dateTime/date, location, description (needs transformation)

          // AFTER: Generate monthKey for grouping (e.g., "January 2026")
          const monthKey = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });

          return {
            id: item.id,                              // Unique event identifier from Google Calendar
            title: item.summary || "No Title",        // Event name (summary in Google Calendar API) - was "title" in old JSON
            startTime: startTimeStr,                  // Start time or "All Day"
            endTime: endTimeStr,                      // End time (empty for all-day events)
            date: dateString,                         // AFTER: Added formatted date string
            // BEFORE: location: item.location || "TBD"
            // AFTER: Log location for debugging, check if API returns it
            location: item.location || "TBD",         // Event location (defaults to "TBD" if not specified)
            // BEFORE: description: item.description || ""
            // AFTER: Strip HTML from description for clean text display
            description: stripHtml(item.description || ""),
            // AFTER: Store raw timestamp for filtering/sorting by date
            startTimestamp: dateObj.getTime(),
            // AFTER: Store end timestamp for determining when event is truly over
            // Uses assumed 1 hour duration if no end time provided
            endTimestamp: endTimestampForFiltering,
            // AFTER: Store monthKey for grouping
            monthKey: monthKey,
          };
        }).filter(Boolean); // AFTER: Filter out null entries from malformed data

        // ========================================
        // UPDATE STATE WITH FETCHED DATA
        // ========================================
        setData(mappedData);    // Store the transformed events in state
        setLoading(false);      // Hide the loading indicator
        // AFTER: Reset refreshing state after fetch completes
        setRefreshing(false);
      })
      .catch((err) => {
        // ========================================
        // NETWORK ERROR HANDLING
        // ========================================
        // Catch any network errors (e.g., no internet connection, API endpoint unreachable)
        console.error("Error fetching events:", err);
        // AFTER: Set user-friendly error message for network failures
        setError("Unable to connect. Please check your internet connection and try again.");
        setLoading(false);
        // AFTER: Reset refreshing state on error
        setRefreshing(false);
      });
    // ========================================
    // END OF NEW IMPLEMENTATION
    // ========================================
  };

  useEffect(() => {
    fetchEvents();
  }, []); // Empty dependency array: run this effect only once when component mounts

  // ========================================
  // REAL-TIME EVENT FILTERING TIMER
  // ========================================
  // AFTER: Added timer to update currentTime every minute
  // This forces the event filtering to recalculate, moving events to "Past" in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  // ========================================
  // PULL-TO-REFRESH HANDLER
  // ========================================
  // AFTER: Added onRefresh handler for pull-to-refresh functionality
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents(true); // Pass true to indicate this is a refresh, not initial load
  };

  // ========================================
  // FILTER AND SORT EVENTS
  // ========================================
  // AFTER: Added logic to filter events into upcoming vs past, with proper sorting
  // Events are now considered "past" only after their END time, not start time
  // Uses currentTime state (updated every minute) instead of Date.now() for real-time updates
  const now = currentTime;

  // Separate upcoming and past events (using endTimestamp for past event cutoff)
  const upcomingEvents = data
    .filter(event => event.endTimestamp >= now)
    .sort((a, b) => a.startTimestamp - b.startTimestamp); // Soonest first

  const pastEvents = data
    .filter(event => event.endTimestamp < now)
    .sort((a, b) => b.startTimestamp - a.startTimestamp); // Most recent first

  // BEFORE: Flat array combination
  // const displayedEvents = showPastEvents 
  //   ? [...upcomingEvents, ...pastEvents]
  //   : upcomingEvents;

  // AFTER: Group events by month for SectionList
  // Helper function to group events by monthKey
  const groupByMonth = (events: EventItem[]): EventSection[] => {
    const grouped: { [key: string]: EventItem[] } = {};

    events.forEach(event => {
      if (!grouped[event.monthKey]) {
        grouped[event.monthKey] = [];
      }
      grouped[event.monthKey].push(event);
    });

    // Convert to sections array, preserving month order from sorted events
    const monthOrder: string[] = [];
    events.forEach(event => {
      if (!monthOrder.includes(event.monthKey)) {
        monthOrder.push(event.monthKey);
      }
    });

    return monthOrder.map(month => ({
      title: month,
      data: grouped[month],
    }));
  };

  // Create sections for upcoming events
  const upcomingSections = groupByMonth(upcomingEvents);

  // Create sections for past events (if enabled)
  const pastSections = showPastEvents && pastEvents.length > 0
    ? [
      // Add "Past Events" divider section (empty data, just a header)
      { title: '___PAST_DIVIDER___', data: [] as EventItem[], isPastDivider: true },
      ...groupByMonth(pastEvents)
    ]
    : [];

  // Combine all sections
  const sections: EventSection[] = [...upcomingSections, ...pastSections];

  // ========================================
  // LOADING STATE UI
  // ========================================
  // BEFORE: Loading view was not centered or styled
  // AFTER: Proper centered loading state with consistent styling
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D25100" />
          <Text style={styles.loadingText}>Loading Events...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ========================================
  // ERROR STATE UI
  // ========================================
  // AFTER: Added error state UI - shows when API call fails
  // Includes retry button so users can attempt to reload without restarting app
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#D25100" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEvents()}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ========================================
  // EMPTY STATE UI
  // ========================================
  // BEFORE: if(data.length === 0) - checked all data regardless of filters
  // BEFORE: if(displayedEvents.length === 0) - checked flat array
  // AFTER: Check sections array for grouped empty state
  // Also added context-aware messages based on whether showing past events
  if (upcomingEvents.length === 0 && (!showPastEvents || pastEvents.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        {/* BEFORE: <Text style={styles.header}>SHPE Conference 2026</Text> */}
        {/* AFTER: Replaced text with logo image as requested */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/shpemaeslogo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        {/* AFTER: Added toggle button even on empty state for consistency */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPastEvents(!showPastEvents)}
        >
          <Ionicons
            name={showPastEvents ? "eye" : "eye-off-outline"}
            size={18}
            color="#666"
          />
          <Text style={styles.toggleButtonText}>
            {showPastEvents ? "Hide Past Events" : "Show Past Events"}
          </Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={64} color="#999" />
          {/* BEFORE: Generic "No Events Scheduled" message */}
          {/* AFTER: Context-aware messages based on filter state */}
          <Text style={styles.emptyTitle}>
            {showPastEvents
              ? "No Events Found"
              : "No Upcoming Events"}
          </Text>
          <Text style={styles.emptyMessage}>
            {showPastEvents
              ? "There are no events in the calendar."
              : "Check back later for upcoming events!"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEvents()}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* BEFORE: <Text style={styles.header}>SHPE Conference 2026</Text> */}
      {/* AFTER: Replaced text with logo image as requested */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/shpemaeslogo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
      {/* AFTER: Added "Show Past Events" toggle button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowPastEvents(!showPastEvents)}
      >
        <Ionicons
          name={showPastEvents ? "eye" : "eye-off-outline"}
          size={18}
          color="#666"
        />
        <Text style={styles.toggleButtonText}>
          {showPastEvents ? "Hide Past Events" : "Show Past Events"}
        </Text>
      </TouchableOpacity>
      {/* BEFORE: FlatList with flat data array */}
      {/* AFTER: SectionList with month-grouped sections */}
      <SectionList
        sections={sections}
        keyExtractor={(item: EventItem) => item.id}
        // AFTER: Added contentContainerStyle for home indicator clearance on newer iPhones
        contentContainerStyle={styles.listContent}
        // AFTER: Added RefreshControl for native pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D25100"
            colors={["#D25100"]} // Android
          />
        }
        // AFTER: Render section headers (month names or Past Events divider)
        renderSectionHeader={({ section }: { section: EventSection }) => {
          // Special handling for Past Events divider
          if (section.isPastDivider) {
            return (
              <View style={styles.pastEventsDivider}>
                <View style={styles.dividerLine} />
                <View style={styles.pastEventsLabelContainer}>
                  <Ionicons name="time-outline" size={16} color="#888" />
                  <Text style={styles.pastEventsLabel}>Past Events</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>
            );
          }
          // Regular month header
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          );
        }}
        renderItem={({ item }: { item: EventItem }) => (
          // BEFORE: style={styles.card}onPress - missing space
          // AFTER: Added space between style and onPress
          <TouchableOpacity
            style={styles.card}
            // AFTER: Added activeOpacity for better touch feedback
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: "/details/[id]",
                params: {
                  id: item.id,
                  title: item.title,
                  // Pass both start and end times to details screen
                  startTime: item.startTime,
                  endTime: item.endTime,
                  // AFTER: Also passing date for complete event info
                  date: item.date,
                  location: item.location,
                  description: item.description,
                  startTimestamp: item.startTimestamp,
                }
              })
            }}
          >
            <View style={styles.row}>
              {/* Time column: start time on top, "to end time" below, then date */}
              <View style={styles.timeContainer}>
                <Text style={styles.startTime}>{item.startTime}</Text>
                {item.endTime ? (
                  <Text style={styles.endTime}>to {item.endTime}</Text>
                ) : null}
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        // AFTER: Don't render empty sections (except for past divider which has no items)
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 10 },
  // BEFORE: loadingContainer was defined but never used properly
  // AFTER: Renamed to centerContainer and used for loading, error, and empty states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // BEFORE: header: {fontSize: 24, fontWeight: 'bold', color: '#002649', marginBottom: 15},
  // AFTER: Replaced text header with logo container styling
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  // AFTER: Made logo responsive based on screen width (matching Home tab)
  headerLogo: {
    width: Math.min(SCREEN_WIDTH * 0.55, 220),   // 55% of screen width, max 220
    height: Math.min(SCREEN_WIDTH * 0.18, 70),   // Proportional height
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#002649',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  // BEFORE: timeContainer minWidth: 75, maxWidth: 90 - too cramped for date format
  // AFTER: Adjusted for cleaner time-first layout
  // AFTER: Adjusted for cleaner time-first layout
  timeContainer: {
    minWidth: 80,
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    alignItems: 'flex-start',
  },
  // Start time - primary, bold, orange
  startTime: {
    fontWeight: '800',
    color: '#D25100',
    fontSize: 15,
  },
  // End time - smaller with "to" prefix
  endTime: {
    color: '#D25100',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.85,
  },
  // Date below times, muted for visual hierarchy
  date: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  info: { flex: 1, justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 17, color: '#002649', marginBottom: 4 },
  location: { color: '#666', fontSize: 13, marginTop: 4 },
  // AFTER: Added listContent style for FlatList padding (home indicator clearance)
  listContent: {
    paddingBottom: 20,
  },
  // AFTER: Added styles for loading state
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // AFTER: Added styles for error state
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D25100',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // AFTER: Added styles for empty state
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // AFTER: Added styles for "Show Past Events" toggle button
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  // AFTER: Added styles for month section headers
  sectionHeader: {
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#002649',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // AFTER: Added styles for "Past Events" divider
  pastEventsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  pastEventsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  pastEventsLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
})
