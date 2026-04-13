# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-04-13

### Added
- Desktop Notifications for prayer times.
- Next Prayer Countdown timer.
- Hijri Calendar display.
- Qibla Direction indicator.
- Full adhan audio file for complete prayer calls.

### Fixed
- Prevented stale prayer notifications from triggering when the device wakes from sleep.


## [1.0.3] - 2026-03-25

### Added
- Per-prayer notification settings (active/silent toggles) directly on the prayer cards with slide-in animation.
- Offscreen document integration for robust background audio playback.

### Changed
- Reorganized project structure: moved assets, css, js, and pages into dedicated subdirectories.
- Improved service worker reliability, transitioning from localStorage to chrome.storage.local.
- Bumped extension version to 1.0.3 in `manifest.json`.

## [1.0.2] - 2026-03-24

### Added
- Created a project README.md with features and roadmap.
- Added a .gitignore file to exclude OS and IDE specific files.
- Added GitHub Actions for automatic releases upon pushing tags.
- Added .github/workflows/release.yml to automate ZIP creation and GitHub release assets.

## [1.0.1] - 2026-03-24

### Changed
- Flattened the translations object and removed the ID language version.
- Removed the language toggle button from the user interface.
- Cleaned up the CSS for better alignment in the action group.
- Updated extension version to 1.0.1 in `manifest.json`.

## [1.0.0] - 2026-03-24

### Added

- Initial project setup for the prayer times extension.
- Automatic location detection through browser geolocation.
- Real-time prayer times retrieval using the Aladhan API.
- Caching for prayer times to ensure persistent data loading.
- Light and Dark mode theme support.
