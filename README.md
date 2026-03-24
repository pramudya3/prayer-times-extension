# Prayer Times Browser Extension

A lightweight browser extension designed to provide accurate daily prayer times based on the user's current geographical location.

## Description

The Prayer Times extension automatically detects your location using your browser's geolocation API and retrieves real-time prayer timings from the Aladhan API. It features a clean, responsive interface that supports both light and dark modes, ensuring a consistent user experience.

## Current Features

- Automatic Location Detection: Uses reverse geocoding to display your city and country.
- Accurate Timings: Fetches Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times.
- Data Persistence: Caches the last retrieved timings to ensure instant loading when the popup is opened.
- Theme Support: Includes a dedicated toggle for switching between Light and Dark modes.
- Manual Refresh: Allows users to force a location update and refresh timings at any time.

## Project Structure

- manifest.json: Extension configuration and permissions.
- popup.html: The main user interface structure.
- popup.js: Logic for geolocation, API integration, and theme management.
- popup.css: Styling for the popup interface.
- theme.js: Ensures the correct theme is applied during initial load to prevent flashing.

## Roadmap and Planned Features

The following features are scheduled for implementation in future updates:

| Feature               | Description                                                                | Status      |
| --------------------- | -------------------------------------------------------------------------- | ----------- |
| Desktop Notifications | Browser-based alerts for each prayer time.                                 | In Progress |
| Next Prayer Countdown | A live timer showing the remaining time to the next prayer.                | Planned     |
| Calculation Settings  | Options to choose between different calculation methods (e.g., MWL, ISNA). | Planned     |
| Adhan Audio           | Optional audio alerts for prayer times with custom sound selection.        | Planned     |
| Hijri Calendar        | Display of the current Hijri date alongside the Gregorian date.            | Planned     |
| Badge Time            | Display the time for the next prayer on the extension icon badge.          | Planned     |

## Installation

1. Open your browser's extension management page (e.g., chrome://extensions, edge://extensions, etc.).
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" and select the project directory.
