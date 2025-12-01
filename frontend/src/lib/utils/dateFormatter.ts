/**
 * Format timestamp from Linera backend (microseconds) to readable date string
 * @param timestamp - Timestamp in microseconds from Linera backend
 * @returns Formatted date string or 'Unknown' if invalid
 */
export function formatTimestamp(timestamp: number | string | undefined): string {
	if (!timestamp) return 'Unknown';

	const num = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
	if (isNaN(num)) return 'Unknown';

	// Convert microseconds to milliseconds (divide by 1000)
	const milliseconds = num / 1000;
	const date = new Date(milliseconds);

	// Validate date is reasonable (after year 2000)
	if (date.getFullYear() < 2000) return 'Unknown';

	return date.toLocaleDateString();
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago", "3 days ago")
 * @param timestamp - Timestamp in microseconds from Linera backend
 * @returns Relative time string or 'Unknown' if invalid
 */
export function formatRelativeTime(timestamp: number | string | undefined): string {
	if (!timestamp) return 'Unknown';

	const num = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
	if (isNaN(num)) return 'Unknown';

	// Convert microseconds to milliseconds
	const milliseconds = num / 1000;
	const date = new Date(milliseconds);

	if (date.getFullYear() < 2000) return 'Unknown';

	const now = Date.now();
	const diffMs = now - milliseconds;
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) return 'Just now';
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

	return date.toLocaleDateString();
}
