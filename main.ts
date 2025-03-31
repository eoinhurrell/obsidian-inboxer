import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface InboxTimelineSettings {
	inboxHeadingText: string;
	timelineHeadingText: string;
}

const DEFAULT_SETTINGS: InboxTimelineSettings = {
	inboxHeadingText: "INBOX",
	timelineHeadingText: "TIMELINE",
};

export default class InboxTimelinePlugin extends Plugin {
	settings: InboxTimelineSettings;

	async onload() {
		await this.loadSettings();

		// Register the Add to Inbox command
		this.addCommand({
			id: "add-to-inbox",
			name: "Add to Inbox",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addToInbox(editor);
			},
		});

		// Register the Add to Timeline command
		this.addCommand({
			id: "add-to-timeline",
			name: "Add to Timeline",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addToTimeline(editor);
			},
		});

		// Add settings tab
		this.addSettingTab(new InboxTimelineSettingTab(this.app, this));
	}

	/**
	 * Find the last occurrence of a heading in the document or create it if it doesn't exist
	 *
	 * @param editor The active editor
	 * @param headingText The text to search for in headings
	 * @returns Object containing the position and level of the heading
	 */
	findOrCreateHeading(
		editor: Editor,
		headingText: string,
	): { pos: { line: number; ch: number }; level: number } {
		const content = editor.getValue();
		const lines = content.split("\n");

		// Search for heading in reverse order (last to first)
		for (let i = lines.length - 1; i >= 0; i--) {
			const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
			if (match && match[2].trim() === headingText) {
				return {
					pos: { line: i, ch: lines[i].length },
					level: match[1].length,
				};
			}
		}

		// Create heading if not found
		const newHeadingLine = `\n## ${headingText}\n`;
		const lastLine = editor.lastLine();
		editor.replaceRange(newHeadingLine, {
			line: lastLine,
			ch: editor.getLine(lastLine).length,
		});

		return {
			pos: { line: lastLine + 1, ch: 0 },
			level: 2, // New headings are level 2
		};
	}

	/**
	 * Find the position to insert a new child heading
	 *
	 * @param editor The active editor
	 * @param headingPos The position of the parent heading
	 * @param headingLevel The level of the parent heading
	 * @returns Position to insert the new child heading
	 */
	findInsertionPoint(
		editor: Editor,
		headingPos: { line: number; ch: number },
		headingLevel: number,
	): { line: number; ch: number } {
		const content = editor.getValue();
		const lines = content.split("\n");

		let currentLine = headingPos.line + 1;
		let lastChildLine = headingPos.line;

		while (currentLine < lines.length) {
			const match = lines[currentLine].match(/^(#{1,6})\s+.+$/);

			if (match) {
				const level = match[1].length;

				if (level <= headingLevel) {
					// Found next heading of same or higher level, stop searching
					break;
				}

				if (level === headingLevel + 1) {
					// Found a direct child heading
					lastChildLine = currentLine;
				}
			}

			currentLine++;
		}

		// If we didn't find any child headings, add right after the parent heading
		// Otherwise, add after the last child
		return {
			line: lastChildLine,
			ch: lines[lastChildLine].length,
		};
	}

	/**
	 * Add a new child heading under the INBOX heading
	 *
	 * @param editor The active editor
	 */
	addToInbox(editor: Editor) {
		const { pos, level } = this.findOrCreateHeading(
			editor,
			this.settings.inboxHeadingText,
		);
		const insertPos = this.findInsertionPoint(editor, pos, level);

		const childHeadingText = `\n${"#".repeat(level + 1)} `;
		editor.replaceRange(childHeadingText, insertPos);

		// Place cursor after the heading syntax
		editor.setCursor({
			line: insertPos.line + 1,
			ch: level + 2, // +2 accounts for the # chars plus the space
		});
	}

	/**
	 * Add a new child heading under the TIMELINE heading with a timestamp
	 *
	 * @param editor The active editor
	 */
	addToTimeline(editor: Editor) {
		const { pos, level } = this.findOrCreateHeading(
			editor,
			this.settings.timelineHeadingText,
		);
		const insertPos = this.findInsertionPoint(editor, pos, level);

		// Format the current date and time
		const now = new Date();
		const timestamp = now
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "")
			.slice(0, 16); // Format as YYYY-MM-DD HH:MM

		const childHeadingText = `\n${"#".repeat(level + 1)} ${timestamp} `;
		editor.replaceRange(childHeadingText, insertPos);

		// Place cursor after the timestamp
		editor.setCursor({
			line: insertPos.line + 1,
			ch: childHeadingText.length - 1,
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class InboxTimelineSettingTab extends PluginSettingTab {
	plugin: InboxTimelinePlugin;

	constructor(app: App, plugin: InboxTimelinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Inbox & Timeline Settings" });

		new Setting(containerEl)
			.setName("Inbox heading text")
			.setDesc(
				"The text to search for when finding/creating the inbox heading",
			)
			.addText((text) =>
				text
					.setPlaceholder("INBOX")
					.setValue(this.plugin.settings.inboxHeadingText)
					.onChange(async (value) => {
						this.plugin.settings.inboxHeadingText = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Timeline heading text")
			.setDesc(
				"The text to search for when finding/creating the timeline heading",
			)
			.addText((text) =>
				text
					.setPlaceholder("TIMELINE")
					.setValue(this.plugin.settings.timelineHeadingText)
					.onChange(async (value) => {
						this.plugin.settings.timelineHeadingText = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
