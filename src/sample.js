// The Create a sample page command: one note that shows what Isfahan does to
// a page (the property ribbon, the drop cap, margin footnotes, the callouts,
// tasks, a quote and a table), written beside the user's new notes and
// opened in Reading view. Only ever on request; it never overwrites a note.
import { Notice, TFile } from "obsidian";
import { ymdOf } from "./core/dates.js";

export const SAMPLE_NAME = "Isfahan sample page";

export const samplePage = (today) => `---
cssclasses: page
kind: Sample page
made: ${today}
tags:
  - isfahan
  - sample
---

## A page in Isfahan

This note shows what Isfahan does to a page. The plugin is named after the city in central Iran whose mosques gave it its colors: lapis and turquoise tile over warm brick.[^1] Switch to editing view to see how each part is written, then back to Reading view to see it as a page.

## Four phases

The colors follow the sun where you live. *Dawn* is warm paper, *Workday* crisp lapis, *Evening* deep indigo and gold, and *Night* midnight blue. Click the phase in the status bar to try one, or run **Follow the sun** to go back. ==Every phase keeps the page easy to read.==

| Phase | When | Mode |
|---|---|---|
| Dawn | the three hours after sunrise | light |
| Workday | from then until sunset | light |
| Evening | the two hours after sunset | dark |
| Night | from then until sunrise | dark |

> [!pull] Pull quote
> The tiles of Isfahan change with the light all day. Your vault can too.

## Margin notes

Footnotes move into the margin beside their line, the way a printed book sets them.[^2] In a narrow window they drop in under their paragraph instead.

> [!tip] Make any note a page
> Page mode covers every note unless you set it to page notes only. Then add \`page\` to a note's \`cssclasses\`, as this one has. Add \`no-page\` to keep a note plain.

> Isfahan is half the world.
>
> (An old Persian saying about the city.)

> [!mihrab] The arch
> A mihrab is the arched niche in a mosque wall. This callout borrows its shape.

## Try it

- [x] Open the sample page
- [ ] Click the phase in the status bar
- [ ] Pick a tile pattern in the settings
- [ ] Open a new tab to see the clock and the weather

Tagged #isfahan, so you can find this note again or delete it when you're done.

[^1]: Isfahan was the capital of Safavid Persia from 1598, when Shah Abbas I moved his court there.
[^2]: **Margin notes** that start with a bold word, like this one, read as a gloss.
`;

export const Sample = {
  // A new note beside the user's other new notes, numbered if the name is
  // taken, opened in Reading view so Page mode shows at once.
  async createSamplePage() {
    const parent = this.app.fileManager.getNewFileParent("");
    const dir = parent.path === "/" ? "" : `${parent.path}/`;
    let path = `${dir}${SAMPLE_NAME}.md`;
    for (let n = 2; this.app.vault.getAbstractFileByPath(path); n++) path = `${dir}${SAMPLE_NAME} ${n}.md`;
    let file;
    try {
      file = await this.app.vault.create(path, samplePage(ymdOf(new Date())));
    } catch (e) {
      new Notice(`Couldn't create the sample page: ${e.message}`);
      return;
    }
    if (!(file instanceof TFile)) return;
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file, { active: true, state: { mode: "preview" } });
  },

  registerSampleCommand() {
    this.addCommand({ id: "create-sample-page", name: "Create a sample page", callback: () => this.createSamplePage() });
  },
};
