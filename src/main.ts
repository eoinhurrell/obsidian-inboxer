import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import {
	findHeadingInText,
	findInsertionPointInText,
	createHeadingText,
	createChildHeadingText,
	createTimelineHeadingText,
	calculateCursorPosition,
	HeadingInfo,
} from "./utils/document-utils";

interface InboxerSettings {
	inboxHeadingText: string;
	timelineHeadingText: string;
}

const DEFAULT_SETTINGS: InboxerSettings = {
	inboxHeadingText: "INBOX",
	timelineHeadingText: "TIMELINE",
};

export default class InboxerPlugin extends Plugin {
	settings: InboxerSettings;

	async onload() {
		await this.loadSettings();

		// Register the Add to Inbox command
		this.addCommand({
			id: "inboxer-add-to-inbox",
			name: "Add to Inbox",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addToInbox(editor);
			},
		});

		// Register the Add to Timeline command
		this.addCommand({
			id: "inboxer-add-to-timeline",
			name: "Add to Timeline",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addToTimeline(editor);
			},
		});

		// Add settings tab
		this.addSettingTab(new InboxerSettingTab(this.app, this));
	}

	/**
	 * Find the last occurrence of a heading in the document or create it if it doesn't exist
	 *
	 * @param editor The active editor
	 * @param headingText The text to search for in headings
	 * @returns Object containing the position and level of the heading
	 */
	findOrCreateHeading(editor: Editor, headingText: string): HeadingInfo {
		const content = editor.getValue();
		const headingInfo = findHeadingInText(content, headingText);

		if (headingInfo) {
			return headingInfo;
		}

		// Create heading if not found
		const newHeadingText = createHeadingText(headingText);
		const lastLine = editor.lastLine();
		const lastLineContent = editor.getLine(lastLine);

		const insertPosition = {
			line: lastLine,
			ch: lastLineContent.length,
		};

		editor.replaceRange(newHeadingText, insertPosition);

		return {
			pos: { line: lastLine + 1, ch: 0 },
			level: 2, // New headings are level 2
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

		const content = editor.getValue();
		const insertPos = findInsertionPointInText(content, pos, level);
		const childHeadingText = createChildHeadingText(level);

		editor.replaceRange(childHeadingText, insertPos);

		// Place cursor after the heading syntax
		const cursorPos = calculateCursorPosition(insertPos, childHeadingText);
		editor.setCursor(cursorPos);
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

		const content = editor.getValue();
		const insertPos = findInsertionPointInText(content, pos, level);
		const childHeadingText = createTimelineHeadingText(level);

		editor.replaceRange(childHeadingText, insertPos);

		// Place cursor after the timestamp
		const cursorPos = calculateCursorPosition(
			insertPos,
			childHeadingText,
			true,
		);
		editor.setCursor(cursorPos);
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

export class InboxerSettingTab extends PluginSettingTab {
	plugin: InboxerPlugin;

	constructor(app: App, plugin: InboxerPlugin) {
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
