# gcal-sync

Sync events across different calendars

## How to use

1. Share a remote calendar with your Google calendar via an `.ics` link or otherwise.
1. Create a new App Script on Google, and copy-paste the contents of `sync.js` into it.
1. Make sure that your app has access to the `Calendar` Google API service
1. Fill in the constant values at the top of the script:

```
BUSY_TITLE = "busy - XXXX";             // Title created on the local calendar for events synced from the remote
IGNORE_TITLES = [BUSY_TITLE, "busy"];   // Ignore events that match one of these titles
LOCAL_EMAIL = "drmorr@example.com";     // Email address used for invitations to the local calendar
LOCAL_CALENDAR = "drmorr@example.com";  // Name of the local calendar (often the same as your email, but not always)
REMOTE_CALENDAR = "XXXX";               // Name of the remote calendar as shared inside Google
REMOTE_EMAIL = "drmorr@example.com";    // Email address used for invitations to the remote calendar
REMOTE_EVENT_PREFIX = "XXXX";           // Prefix for events/invitations sent to the remote calendar
```

1. Deploy the script (this will ask you to connect to your Google account and grant permissions)
1. Run the script by clicking the "run" button; you'll need to grant the appropriate permissions the first time.
1. If everything works, execute the script on a schedule by going to Triggers and creating a time-based trigger

## Troubleshooting

### Getting your calendar names

The names shown in the Google Calendar UI don't necessarily match the names as stored in code.  If the script is failing
because it can't find a calendar, you can run the `printCalendarNames` function in the script.
