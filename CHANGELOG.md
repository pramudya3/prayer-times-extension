# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Desktop Notifications for prayer times.
- Next Prayer Countdown timer.
- Hijri Calendar display.
- Qibla Direction indicator.

## [1.0.1] - 2026-03-24

### Changed
- Flattened the translations object and removed the ID language version.
- Removed the language toggle button from the user interface.
- Cleaned up the CSS for better alignment in the action group.
- Updated extension version to 1.0.1 in `manifest.json`.

### Added
- Added a project README.md with features and roadmap.
- Added a .gitignore file to exclude OS and IDE specific files.
- Added GitHub Actions for automatic releases upon pushing tags.
- Added .github/workflows/release.yml to automate ZIP creation and GitHub release assets.

## [1.0.0] - 2026-03-24

### Added

- Initial project setup for the prayer times extension.
- Automatic location detection through browser geolocation.
- Real-time prayer times retrieval using the Aladhan API.
- Caching for prayer times to ensure persistent data loading.
- Light and Dark mode theme support.
