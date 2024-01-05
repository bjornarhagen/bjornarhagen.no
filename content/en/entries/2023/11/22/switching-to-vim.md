# Switching to Neovim from VSCode

## Draft

https://kakoune.org/why-kakoune/why-kakoune.html

### Vim
I've tried Vim quite a few times.
Always gave up after a while.
Takes a long time to configure correctly.

### Helix

Likes:
- Very similar to Vim
- Comes with the things you want out of the box
- - Highlighting
- - LSP for different languages is trivial to setup (they just need to be in path)
- - Cursor hover help
- - Fuzzy search for code
- - Fuzzy search for files
- - File / Buffer / Symbol / Jumplist picker
- Also Vim does not really support multiple cursors, event with plugins, Helix has this out of the box.
- Auto complete for code and commands
- Command search and explainer
- Super easy to use config file
- Some handy keybinds that Vim don't come with like <g-h> instead of <$>, <g-l> instead of <0>, <g-s>

Dislikes:
- Pasting from system clipboard doesn't seem to work
- Pasting via OS goes really slows, and Helix auto inserts closing brackts ) ] } etc, which messes everything up.
- No built in file tree like Netrw in Neovim.
- No plugin support
- Some themes are broken when used inside a Tmux session
