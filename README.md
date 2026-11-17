# Starfall — Purple Space Edition

This is a complete, standalone Starfall site package. It includes the home page, Games, Anime, Manga, Favorites, search, add-item dialogs, game player popup, reader popup, catalog and config files, plus the purple galaxy background.

## Install
1. Extract the ZIP.
2. Upload the contents of this folder into your `Test-v2` repository, replacing the matching site files.
3. Keep any existing `games/` folders and custom game assets in your repository; this package does not contain your separately uploaded game bundles.
4. Commit the files and refresh GitHub Pages.

## Add games
Create `games/my-game/`, upload the complete HTML game folder, then add its entry under `games` in `catalog.json` with `"url": "/games/my-game/index.html"`.

The add buttons save entries in the current browser only. For entries visible to everyone, edit `catalog.json`.

## Notes
- Purple space background is `assets/starfall-purple-space.png`.
- Headline rotates through wonderful, amazing, unblocked, beautiful, perfect, and Heaven.
- This project is a standalone implementation; it does not include third-party proxy code.
