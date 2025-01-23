const BUSY_TITLE = "busy - XXXX";            // TODO fill in
const LOCAL_EMAIL = "drmorr@example.com";    // TODO fill in
const LOCAL_CALENDAR = "drmorr@example.com"; // TODO fill in
const REMOTE_CALENDAR = "XXXX";              // TODO fill in
const REMOTE_EMAIL = "drmorr@example.com";   // TODO fill in
const REMOTE_EVENT_PREFIX = "XXXX";          // TODO fill in

const IGNORE_TITLES_REGEX = [BUSY_TITLE, "busy", REMOTE_EVENT_PREFIX];

function syncCalendarWithRemote() {
  var numDays = 14;

  var start = new Date();
  var end = new Date(start.getTime() + (60 * 60 * 24 * numDays * 1000));
  var remoteCalendar = CalendarApp.getCalendarsByName(REMOTE_CALENDAR)[0];
  var localCalendar = CalendarApp.getCalendarsByName(LOCAL_CALENDAR)[0];

  var remoteEvents = remoteCalendar.getEvents(start, end);
  var localEvents = localCalendar.getEvents(start, end);

  var remoteEventStartTimes = [];
  for (var i in remoteEvents) {
    var evt = remoteEvents[i];
    var evtStart = evt.getStartTime();
    var evts = findEventsWithStart(evtStart.getTime(), localEvents);
    remoteEventStartTimes.push(evtStart.getTime());
    if (shouldCreateLocalEvent(evts)) {
      console.log("syncing event from remote calendar at " + evtStart);
      localCalendar.createEvent(BUSY_TITLE, evtStart, evt.getEndTime());
    }
  }

  for (var i in localEvents) {
    var evt = localEvents[i];
    var evtStart = evt.getStartTime();
    var evts_at_time = findEventsWithStart(evtStart.getTime(), localEvents);

    if (evt.getTitle() == BUSY_TITLE && !(remoteEventStartTimes.includes(evtStart.getTime()))) {
      console.log("deleting event from local calendar");
      evt.deleteEvent();
    } else if (shouldInviteRemote(evt, evts_at_time)) {
      console.log("inviting remote email for " + evt.getTitle() + " at " + evtStart);
      localCalendar.createEvent(
        REMOTE_EVENT_PREFIX + " - " + evt.getTitle(),
        evt.getStartTime(),
        evt.getEndTime(),
        {"guests": REMOTE_EMAIL, sendInvites: true},
      );
    }
  }
}

function findEventsWithStart(start, events) {
  var ret = []
  for (var i in events) {
    var evtStart = events[i].getStartTime().getTime();
    if (evtStart == start) {
      ret.push(events[i])
    } else if (evtStart > start) {
      break; // Assume the input list is sorted
    }
  }

  return ret;
}

function shouldCreateLocalEvent(evts_at_time) {
  for (var i in evts_at_time) {
    var evt = evts_at_time[i];
    if (evt.getTitle() == BUSY_TITLE || evt.getTitle().startsWith(REMOTE_EVENT_PREFIX)) {
      return false;
    }

    var guests = evt.getGuestList();
    for (var j in guests) {
      if (guests[j].getEmail() == REMOTE_EMAIL) {
        return false;
      }
    }
  }

  return true;
}

function shouldInviteRemote(evt, evts_at_time) {
  for (var j in evts_at_time) {
    var other_evt = evts_at_time[j];
    for (var i in IGNORE_TITLES_REGEX) {
      if (other_evt.getTitle().search(IGNORE_TITLES_REGEX[i]) != -1) {
        return false;
      }
    }
  }
  var localGuest = evt.getGuestByEmail(LOCAL_EMAIL);
  var remoteGuest = evt.getGuestByEmail(REMOTE_EMAIL);

  if (
    (evt.isOwnedByMe()
      || (localGuest != null && localGuest.getGuestStatus() == CalendarApp.GuestStatus.YES))
    && !evt.isAllDayEvent()
    && remoteGuest == null
  ) {
        return true;
  }

  return false;
}

function getCalendarNames() {
    var calendars = CalendarApp.getAllCalendars();
    for (var i in calendars) {
        console.log(calendars[i].getName());
    }
}
