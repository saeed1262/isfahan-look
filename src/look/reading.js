// Reading notes: Page mode (margin notes, drop cap, the text column, quiet
// chrome) and the reading-progress line.

import { MarkdownRenderChild, MarkdownRenderer, MarkdownView, TFile, setIcon } from "obsidian";
import { footnoteDefs, footnoteRefs, readingMarks } from "../core/notes.js";
import { NO_PAGE_CLASSES, PAGE_CLASS } from "../core/settings.js";
import { frontmatterClasses } from "../core/text.js";

// Watch a freshly rendered block for a few seconds and re-run `fn` when
// something else (the Tasks plugin, say) rebuilds part of it. `fn` must be
// idempotent; its own changes re-trigger at most one more no-op run.
export function watchLateRenders(el, fn, ms = 3000) {
  let t = null;
  const obs = new MutationObserver(() => {
    window.clearTimeout(t);
    t = window.setTimeout(fn, 30);
  });
  obs.observe(el, { childList: true, subtree: true });
  window.setTimeout(() => obs.disconnect(), ms);
}


export const Reading = {
  pageActive() {
    return this.settings.enabled && this.settings.pageMode;
  },

  isPageNote(fm) {
    const cls = frontmatterClasses(fm);
    if (cls.includes(PAGE_CLASS)) return true;
    return this.settings.pageScope === "all" && !cls.some((c) => NO_PAGE_CLASSES.includes(c));
  },

  isPageFile(file) {
    if (!file || file.extension !== "md") return false;
    return this.isPageNote(this.app.metadataCache.getFileCache(file)?.frontmatter);
  },

  // Page mode: put each footnote beside the line that references it.
  // Reading view only (post-processors don't run in Live Preview). The
  // footnote text comes from the note's source rather than the rendered
  // footnotes section, because reading view renders a long note in pieces
  // and that section may not exist yet when an early paragraph renders.
  sidenotes(el, ctx) {
    if (!this.pageActive()) return;
    const fm = ctx.frontmatter ?? this.app.metadataCache.getCache(ctx.sourcePath)?.frontmatter;
    if (!this.isPageNote(fm)) return;
    const sups = el.querySelectorAll("sup.footnote-ref, sup[data-footnote-id]");
    if (!sups.length) return;
    const info = ctx.getSectionInfo(el);
    if (!info) return;
    const block = info.text.split("\n").slice(info.lineStart, info.lineEnd + 1).join("\n");
    const labels = footnoteRefs(block);
    const defs = footnoteDefs(info.text);
    sups.forEach((sup, i) => {
      const md = labels[i] != null ? defs.get(labels[i]) : undefined;
      if (md === undefined) return;
      const note = createSpan({ cls: "isfahan-sidenote" });
      // Obsidian writes the reference as "[3]" (or "[3-1]" when a footnote is
      // cited twice): the number is the first run of digits.
      const n = sup.textContent.match(/\d+/)?.[0] ?? String(i + 1);
      note.dataset.n = n;
      // Print style: the reference in the text is the bare number too.
      const link = sup.querySelector("a");
      if (link) link.textContent = n;
      if (/^\s*\*\*[^*]+\*\*/.test(md)) note.addClass("is-gloss");
      else if (/\]\(vscode:\/\//.test(md)) note.addClass("is-ref");
      const child = new MarkdownRenderChild(note);
      ctx.addChild(child);
      sup.after(note);
      // The renderer wraps the text in a <p>, and a paragraph can't sit
      // inside the paragraph the note floats in: unwrap it.
      MarkdownRenderer.render(this.app, md, note, ctx.sourcePath, child).then(() => {
        const only = note.childElementCount === 1 ? note.firstElementChild : null;
        if (only?.tagName === "P") only.replaceWith(...only.childNodes);
      });
    });
  },

  // Page mode: the drop cap goes on the note's opening paragraph, the first
  // one straight after a ## heading; readingMarks finds its line.
  dropCap(el, ctx) {
    if (!this.pageActive()) return;
    const p = el.firstElementChild;
    if (p?.tagName !== "P") return;
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    const cache = file instanceof TFile ? this.app.metadataCache.getFileCache(file) : null;
    if (!this.isPageNote(cache?.frontmatter)) return;
    const info = ctx.getSectionInfo(el);
    const { dropLine } = readingMarks(cache);
    if (info && dropLine !== null && info.lineStart === dropLine) p.addClass("isfahan-dropcap");
  },



  // Page state comes in bursts (two or three events per tab switch, one per
  // autosave while typing), so the events are gathered into one pass a
  // moment later. "active" redoes the note in front and the explorer badges;
  // "all" also every open note's date title and the new tabs.
  queuePageState(scope = "all") {
    this.pageScope = this.pageScope === "all" || scope === "all" ? "all" : "active";
    if (this.pageTimer) return;
    this.pageTimer = this.later(() => {
      const sc = this.pageScope;
      this.pageTimer = null;
      this.pageScope = null;
      this.updatePageState(sc);
    }, 50);
  },

  // Quiet chrome + progress line follow whichever page note is being read.
  updatePageState(scope = "all") {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (scope === "all") { this.markNotesColumn(); this.markNewTabs(); }
    else if (view) this.markNotesColumn(view.leaf);
    const reading = !!view && view.getMode() === "preview" && this.pageActive() && this.isPageFile(view.file);
    document.body.toggleClass("isfahan-reading-page", reading && this.settings.quietChrome);
    this.trackProgress(reading ? view : null);
  },

  // A note with footnotes keeps its margin column; one without gets the
  // centered column (styles.css). A class on the reading view, from
  // Obsidian's index, in place of a :has() over the whole view.
  markNotesColumn(onlyLeaf = null) {
    for (const leaf of onlyLeaf ? [onlyLeaf] : this.app.workspace.getLeavesOfType("markdown")) {
      const pv = leaf.view?.containerEl?.querySelector(".markdown-reading-view .markdown-preview-view");
      if (!pv || !leaf.view.file) continue;
      pv.toggleClass("isfahan-has-notes", readingMarks(this.app.metadataCache.getFileCache(leaf.view.file)).hasNotes);
    }
  },



  // A thin reading-progress line along the top of the note being read.
  trackProgress(view) {
    if (this.progress && this.progress.view === view) return;
    if (this.progress) {
      this.progress.scroller.removeEventListener("scroll", this.progress.onScroll);
      this.progress.bar.remove();
      this.progress = null;
    }
    const scroller = view?.previewMode?.containerEl?.querySelector(".markdown-preview-view");
    if (!scroller) return;
    const bar = view.contentEl.createDiv({ cls: "isfahan-progress" });
    // Full width and scaled (a transform, so no layout per frame), with the
    // scroll position read at most once per animation frame.
    let queued = false;
    const paint = () => {
      queued = false;
      const max = scroller.scrollHeight - scroller.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scroller.scrollTop / max) : 0})`;
    };
    const onScroll = () => { if (!queued) { queued = true; window.requestAnimationFrame(paint); } };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    paint();
    this.progress = { view, scroller, bar, onScroll };
  },

  // Reading view's wiring: the post-processors, and the page state redone on
  // tab switches, file opens and saves of the note in front (that note only)
  // and on layout changes, including reading/editing switches (everything).
  startReading() {
    this.registerMarkdownPostProcessor((el, ctx) => this.sidenotes(el, ctx));
    this.registerMarkdownPostProcessor((el, ctx) => this.dropCap(el, ctx));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.queuePageState("active")));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.queuePageState("all")));
    this.registerEvent(this.app.workspace.on("file-open", () => this.queuePageState("active")));
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) this.queuePageState("active");
      })
    );
  },

  stopReading() {
    document.querySelectorAll(".isfahan-day-title").forEach((x) => x.remove());
    this.trackProgress(null);
    document.body.removeClass("isfahan-reading-page");
    this.rerenderPreviews(); // drop the margin notes this plugin added
  },
};
