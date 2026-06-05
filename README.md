# Inboxer, an Obsidian Plugin

A simple Obsidian plugin that helps you organize notes with dedicated inbox and timeline sections. I made this to use with daily notes or project notes, to keep a running inbox and a running timeline of events.

## Features

- **Add to Inbox**: Add new headings under an "INBOX" section
<img width="600" height="467" alt="cast-inbox" src="https://github.com/user-attachments/assets/35d3f3da-ae9a-4cca-afa8-c08caad723b1" />

- **Add to Timeline**: Add timestamped entries under a "TIMELINE" section
<img width="600" height="625" alt="cast-timeline" src="https://github.com/user-attachments/assets/950db113-d3ed-492a-a9f3-5fed67448694" />

## Settings

| Setting               | Description                                               | Default  |
| --------------------- | --------------------------------------------------------- | -------- |
| Inbox heading text    | Text to search for when finding/creating inbox heading    | INBOX    |
| Timeline heading text | Text to search for when finding/creating timeline heading | TIMELINE |

## Usage Example

Starting with a note:

```markdown
# My Note

Some content here.
```

After using "Add to Inbox" command:

```markdown
# My Note

Some content here.

## INBOX

### Your new inbox item
```

Thereafter "Add to Inbox" will add a new child heading under INBOX

After using "Add to Timeline" command:

```markdown
# My Note

Some content here.

## INBOX

### Your new inbox item

## TIMELINE

### 2025-04-03 14:30 Your timeline entry
```

Thereafter "Add to Timeline" will add a new timestamped child heading under INBOX

## Installation

1. Download latest release and extract to `.obsidian/plugins`

## How It Works

The plugin finds (or creates) your inbox/timeline headings and inserts new entries. It preserves section hierarchy and places the cursor for immediate typing.
