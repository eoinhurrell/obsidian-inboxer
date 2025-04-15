import {
	findHeadingInText,
	findInsertionPointInText,
	createHeadingText,
	createChildHeadingText,
	createTimelineHeadingText,
	calculateCursorPosition,
} from "../document-utils";

describe("findHeadingInText", () => {
	it("should find a heading in text", () => {
		const content = "# Title\n## INBOX\n### Item 1";
		const result = findHeadingInText(content, "INBOX");

		expect(result).toEqual({
			pos: { line: 1, ch: 8 },
			level: 2,
		});
	});

	it("should return null if heading not found", () => {
		const content = "# Title\n## Other\n### Item 1";
		const result = findHeadingInText(content, "INBOX");

		expect(result).toBeNull();
	});

	it("should find the last occurrence of a heading", () => {
		const content = "# Title\n## INBOX\n### Item 1\n## INBOX\n### Item 2";
		const result = findHeadingInText(content, "INBOX");

		expect(result).toEqual({
			pos: { line: 3, ch: 8 },
			level: 2,
		});
	});

	it("should match exact heading text", () => {
		const content =
			"# Title\n## INBOX HEADING\n### Item 1\n## INBOX\n### Item 2";
		const result = findHeadingInText(content, "INBOX");

		expect(result).toEqual({
			pos: { line: 3, ch: 8 },
			level: 2,
		});
	});
});

describe("createHeadingText", () => {
	it("should create a level 2 heading by default", () => {
		const result = createHeadingText("INBOX");
		expect(result).toBe("\n## INBOX\n");
	});

	it("should create a heading with specified level", () => {
		const result = createHeadingText("TIMELINE", 3);
		expect(result).toBe("\n### TIMELINE\n");
	});
});

describe("findInsertionPointInText", () => {
	it("should find insertion point at the end of a section", () => {
		const content =
			"# Title\n## INBOX\n### Item 1\n### Item 2\n## Something Else";

		const result = findInsertionPointInText(
			content,
			{ line: 1, ch: 8 }, // INBOX heading position
			2, // INBOX heading level
		);

		expect(result).toEqual({
			line: 3,
			ch: "### Item 2".length,
		});
	});

	it("should handle empty sections", () => {
		const content = "# Title\n## INBOX\n## Something Else";

		const result = findInsertionPointInText(
			content,
			{ line: 1, ch: 8 }, // INBOX heading position
			2, // INBOX heading level
		);

		expect(result).toEqual({
			line: 1,
			ch: "## INBOX".length,
		});
	});

	it("should handle nested headings of different levels", () => {
		const content =
			"# Title\n## INBOX\n### Level 3\n#### Level 4\n### Another Level 3\n## Something Else";

		const result = findInsertionPointInText(
			content,
			{ line: 1, ch: 8 }, // INBOX heading position
			2, // INBOX heading level
		);

		expect(result).toEqual({
			line: 4,
			ch: "### Another Level 3".length,
		});
	});

	it("should handle last section in document", () => {
		const content = "# Title\n## Other Section\n## INBOX\n### Item 1";

		const result = findInsertionPointInText(
			content,
			{ line: 2, ch: 8 }, // INBOX heading position
			2, // INBOX heading level
		);

		expect(result).toEqual({
			line: 3,
			ch: "### Item 1".length,
		});
	});
});

describe("createChildHeadingText", () => {
	it("should create a child heading one level below parent", () => {
		const result = createChildHeadingText(2);
		expect(result).toBe("\n### ");
	});

	it("should handle deep nesting", () => {
		const result = createChildHeadingText(4);
		expect(result).toBe("\n##### ");
	});
});

describe("createTimelineHeadingText", () => {
	beforeEach(() => {
		// Mock Date for consistent testing
		const mockDate = new Date("2023-01-15T10:30:00.000Z");
		jest.spyOn(global, "Date").mockImplementation(() => mockDate);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should create a timeline heading with timestamp", () => {
		const result = createTimelineHeadingText(2);
		expect(result).toBe("\n### 2023-01-15 10:30 ");
	});

	// TODO - look into this as a test. Do I need it?
	// it("should use provided date", () => {
	// 	const customDate = new Date("2022-03-25T15:45:00.000Z");
	// 	const result = createTimelineHeadingText(2, customDate);
	// 	expect(result).toBe("\n### 2022-03-25 15:45 ");
	// });

	it("should create deeper level headings when needed", () => {
		const result = createTimelineHeadingText(3);
		expect(result).toBe("\n#### 2023-01-15 10:30 ");
	});
});

describe("calculateCursorPosition", () => {
	it("should place cursor after heading syntax by default", () => {
		const insertPos = { line: 10, ch: 0 };
		const headingText = "\n### ";

		const result = calculateCursorPosition(insertPos, headingText);

		expect(result).toEqual({
			line: 11,
			ch: 4, // After the ### and space
		});
	});

	it("should place cursor at end when specified", () => {
		const insertPos = { line: 10, ch: 0 };
		const headingText = "\n### 2023-01-15 10:30 ";

		const result = calculateCursorPosition(insertPos, headingText, true);

		expect(result).toEqual({
			line: 11,
			ch: headingText.length - 1, // At the end
		});
	});

	it("should handle heading with no prefix", () => {
		const insertPos = { line: 10, ch: 0 };
		const headingText = "No heading prefix";

		const result = calculateCursorPosition(insertPos, headingText);

		expect(result).toEqual({
			line: 11,
			ch: 0, // At the beginning since no prefix
		});
	});
});
