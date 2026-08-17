# Hikaru and GothamChess Tell You to MOVE (Fixed and Updated)

A browser extension for Chrome, Brave, and other Chromium browsers that plays voice clips from Hikaru Nakamura and GothamChess (Levy Rozman) whenever you spend too much time thinking on a chess move[cite: 3, 5]. Works on Chess.com and Lichess[cite: 3].

## What is Fixed

The original extension stopped working due to front-end updates on Chess.com. This fork addresses those issues:

* Modern Clock Selectors: Updated the DOM target queries to detect the current Chess.com clock elements and layout containers.
* Turn Detection: Improved the mutation observer logic so the extension reliably knows when your turn starts and ends.
* Broader URL Matching: Expanded `manifest.json` rules so the script injects into modern `/game/*` URLs rather than just legacy `/live` paths.
* Manifest V3 Compatibility: Ensured clean execution for modern Chromium browser standards.

## Features

* Choose between Hikaru, GothamChess, or a standard sound effect[cite: 5].
* Set notification triggers based on absolute seconds or percentage of remaining time[cite: 5].
* Optional repeated reminders at custom intervals until you make a move[cite: 5].
* Compatible with Chess.com and Lichess[cite: 3].

## How to Install

1. Clone or download this repository to your computer:
   git clone https://github.com/x-bdx/hikaru-gotham-move-fixed.git
2. Open your browser extensions page (`chrome://extensions` or `brave://extensions`).
3. Turn on Developer mode in the top right corner.
4. Click Load unpacked and select this project folder.
5. Go to Chess.com or Lichess, open the extension popup from your toolbar, and configure your preferred reminder settings[cite: 5].

## Credits and License

This is an updated fork of the original extension created by Jack Li (https://github.com/shuhaoli/hikaru-gotham-move).

Licensed under the GNU General Public License v3.0[cite: 2].