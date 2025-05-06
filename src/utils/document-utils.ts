/**
 * Utility functions for document manipulation
 */

export interface Position {
	line: number;
	ch: number;
}

export interface HeadingInfo {
	pos: Position;
	level: number;
}

/**
 * Find the last occurrence of a heading in the document or determine where it would be created
 *
 * @param content The document content as a string
 * @param headingText The text to search for in headings
 * @returns Object containing the position and level of the heading
 */
export function findHeadingInText(
	content: string,
	headingText: string,
): HeadingInfo | null {
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

	return null;
}

/**
 * Creates text for a new heading at a specified level
 *
 * @param headingText The heading text
 * @param level The heading level (number of # characters)
 * @returns The formatted heading text with newlines
 */
export function createHeadingText(headingText: string, level = 2): string {
	return `\n${"#".repeat(level)} ${headingText}\n`;
}

/**
 * Find the position to insert a new child heading within text content
 *
 * @param content The document content as a string
 * @param headingPos The position of the parent heading
 * @param headingLevel The level of the parent heading
 * @returns Position to insert the new child heading
 */
export function findInsertionPointInText(
	content: string,
	headingPos: Position,
	headingLevel: number,
): Position {
	const lines = content.split("\n");

	// Start after the parent heading
	let insertAfterLine = headingPos.line;
	let currentLine = headingPos.line + 1;

	// Scan through the document
	while (currentLine < lines.length) {
		const match = lines[currentLine].match(/^(#{1,6})\s+.+$/);

		if (match) {
			// Found a heading
			const level = match[1].length;

			if (level <= headingLevel) {
				// Found next heading of same or higher level than parent
				// This means we've exited the parent's section, so stop
				break;
			}
		}

		// Keep track of last line we've seen under the parent heading or its children
		insertAfterLine = currentLine;
		currentLine++;
	}

	// Insert after the last line in the parent's section
	return {
		line: insertAfterLine,
		ch: lines[insertAfterLine].length,
	};
}

/**
 * Creates text for a new child heading
 *
 * @param parentLevel The level of the parent heading
 * @returns The formatted child heading text with newlines
 */
export function createChildHeadingText(parentLevel: number): string {
	return `\n${"#".repeat(parentLevel + 1)} `;
}

/**
 * Creates text for a new child heading with timestamp
 *
 * @param parentLevel The level of the parent heading
 * @param date The date to format as a timestamp
 * @returns The formatted child heading text with timestamp and newlines
 */
export function createTimelineHeadingText(
	parentLevel: number,
	date: Date = new Date(),
): string {
	// Format the current date and time
	const timestamp = new Date(
		date.getTime() - date.getTimezoneOffset() * 60000,
	)
		.toISOString()
		.replace(/T/, " ")
		.replace(/\..+/, "")
		.slice(0, 16); // Format as YYYY-MM-DD HH:MM

	return `\n${"#".repeat(parentLevel + 1)} ${timestamp} `;
}

/**
 * Calculate the cursor position after inserting a heading
 *
 * @param insertPos The position where the heading was inserted
 * @param headingText The heading text that was inserted
 * @param placeCursorAtEnd Whether to place cursor at end of heading (true) or after the prefix (false)
 * @returns The position where the cursor should be placed
 */
export function calculateCursorPosition(
	insertPos: Position,
	headingText: string,
	placeCursorAtEnd = false,
): Position {
	if (placeCursorAtEnd) {
		return {
			line: insertPos.line + 1,
			ch: headingText.length - 1,
		};
	} else {
		// Find the number of # characters plus one for the space
		const match = headingText.match(/^[\n]*(#{1,6})\s/);
		const prefixLength = match ? match[1].length + 1 : 0;

		return {
			line: insertPos.line + 1,
			ch: prefixLength,
		};
	}
}
