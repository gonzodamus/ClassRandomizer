# MyAddon - World of Warcraft Addon

A basic World of Warcraft addon template that demonstrates core addon functionality.

## Installation

1. Create a folder named `MyAddon` in your WoW AddOns directory:
   - **Windows**: `C:\Program Files\World of Warcraft\_retail_\Interface\AddOns\MyAddon\`
   - **Mac**: `/Applications/World of Warcraft/_retail_/Interface/AddOns/MyAddon/`

2. Copy all the addon files into this folder:
   - `MyAddon.toc`
   - `MyAddon.lua`
   - `MyAddon.xml`

3. Restart World of Warcraft or reload your UI (`/reload`)

## Features

- **Slash Commands**: Use `/myaddon` or `/ma` to interact with the addon
- **UI Frame**: A movable, resizable UI window
- **Saved Variables**: Settings are saved between sessions
- **Event Handling**: Responds to player login and addon loading events

## Commands

- `/myaddon` or `/ma` - Show help
- `/myaddon version` - Show addon version
- `/myaddon test` - Test functionality
- `/myaddon show` - Show the addon UI
- `/myaddon hide` - Hide the addon UI
- `/myaddon toggle` - Toggle the addon UI

## Files

- **MyAddon.toc** - Addon metadata and file loading order
- **MyAddon.lua** - Main addon logic and functionality
- **MyAddon.xml** - UI frame definitions

## Customization

This is a template addon that you can customize for your specific needs:

1. **Change the addon name**: Update the `Title` in `MyAddon.toc` and rename files accordingly
2. **Add new functionality**: Extend the Lua functions in `MyAddon.lua`
3. **Modify the UI**: Edit `MyAddon.xml` to change the appearance
4. **Add more slash commands**: Extend the `HandleSlashCommand` function

## WoW API Compatibility

This addon is set for WoW interface version 100200 (Dragonflight). Update the interface number in `MyAddon.toc` for different WoW versions:

- Dragonflight: 100200
- Shadowlands: 100100
- Battle for Azeroth: 100000

## Development Tips

- Use `/dump variable` to inspect variables in-game
- Use `/reload` to reload your UI after making changes
- Check the chat for addon messages (they appear in green)
- The addon saves data in `MyAddonDB` saved variable

## Troubleshooting

- If the addon doesn't load, check that all files are in the correct folder
- If slash commands don't work, try `/reload`
- Check the chat for error messages
- Verify the interface version in the .toc file matches your WoW version