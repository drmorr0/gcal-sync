const BUSY_TITLE = "busy - XXXX";            // TODO fill in
const IGNORE_TITLES = [BUSY_TITLE, "busy"];
const LOCAL_EMAIL = "drmorr@example.com";    // TODO fill in
const LOCAL_CALENDAR = "drmorr@example.com"; // TODO fill in
const REMOTE_CALENDAR = "XXXX";              // TODO fill in
const REMOTE_EMAIL = "drmorr@example.com";   // TODO fill in
const REMOTE_EVENT_PREFIX = "XXXX";          // TODO fill in

function syncCalendarWithRemote() {
    var numDays = 5;

    var start = new Date();
    var end = new Date(start.getTime() + (60 * 60 * 24 * numDays * 1000));
    var remoteCalendar = CalendarApp.getCalendarsByName(REMOTE_CALENDAR)[0];
    var localCalendar = CalendarApp.getCalendarsByName(LOCAL_CALENDAR)[0];

    var remoteEvents = remoteCalendar.getEvents(start, end);
    var localEvents = localCalendar.getEvents(start, end);

    var searchIndex = 0;
    var remoteEventStartTimes = [];
    for (var i in remoteEvents) {
        var evt = remoteEvents[i];
        var evtStart = evt.getStartTime();
        var [evts, searchIndex] = findEventsWithStart(evtStart.getTime(), localEvents, searchIndex);
        remoteEventStartTimes.push(evtStart.getTime());
        if (shouldCreateEvent(evts)) {
            console.log("syncing event from remote calendar at " + evtStart);
            localCalendar.createEvent(BUSY_TITLE, evtStart, evt.getEndTime());
        }
    }

    for (var i in localEvents) {
        var evt = localEvents[i];
        var evtStart = evt.getStartTime();
        if (evt.getTitle() == BUSY_TITLE && !(remoteEventStartTimes.includes(evtStart.getTime()))) {
            console.log("deleting event from local calendar at " + evtStart);
            evt.deleteEvent();
        } else if (!IGNORE_TITLES.includes(evt.getTitle()) && shouldInviteRemote(evt)) {
            console.log("inviting remote email for event at " + evtStart);
            localCalendar.createEvent(
                REMOTE_EVENT_PREFIX " - " + evt.getTitle(),
                evt.getStartTime(),
                evt.getEndTime(),
                {"guests": REMOTE_EMAIL, sendInvites: true},
            )
        }
    }
}

function findEventsWithStart(start, events, index) {
    var ret = [];
    for (var i = index; i < events.length; i++) {
        var evtStart = events[i].getStartTime().getTime();
        if (evtStart == start) {
            ret.push(events[i])
        } else if (evtStart > start) {
            break; // Assume the input list is sorted
        }
    }

    return [ret, i]
}

function shouldCreateEvent(evts) {
    for (var i in evts) {
        if (evts[i].getTitle() == BUSY_TITLE) {
            return false;
        }

        var guests = evts[i].getGuestList();
        for (var j in guests) {
            if (guests[j].getEmail() == REMOTE_EMAIL) {
                return false;
            }
        }
    }

    return true;
}

function shouldInviteRemote(evt) {
    var localGuest = evt.getGuestByEmail(LOCAL_EMAIL);
    var remoteGuest = evt.getGuestByEmail(REMOTE_EMAIL);

    if ((evt.isOwnedByMe()
        || (localGuest != null && localGuest.getGuestStatus() == CalendarApp.GuestStatus.YES))
        && !evt.isAllDayEvent()
        && remoteGuest == null
    ) {
        return true;
    }

    return false;
}
