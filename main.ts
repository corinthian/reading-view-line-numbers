import { MarkdownPostProcessorContext, MarkdownView, Menu, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import {
  DEFAULT_SETTINGS,
  ReadingLineNumbersSettings,
  ReadingLineNumbersSettingTab,
} from "./settings";

export default class ReadingLineNumbersPlugin extends Plugin {
  settings: ReadingLineNumbersSettings;
  private leafOverrides = new WeakSet<HTMLElement>();

  async onload() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );

    this.addSettingTab(new ReadingLineNumbersSettingTab(this.app, this));

    this.registerMarkdownPostProcessor(
      (element: HTMLElement, context: MarkdownPostProcessorContext) => {
        // Guard against double-processing on re-render
        if (element.querySelector(".rv-line-number")) return;

        let leafOverridden = false;
        this.app.workspace.iterateAllLeaves((leaf) => {
          if (leafOverridden) return;
          if (
            leaf.view instanceof MarkdownView &&
            leaf.view.getMode() === "preview" &&
            leaf.view.previewMode.containerEl.contains(element)
          ) {
            leafOverridden = this.leafOverrides.has(leaf.view.previewMode.containerEl);
          }
        });
        const shouldShow = this.settings.enabled !== leafOverridden;
        if (!shouldShow) return;

        const info = context.getSectionInfo(element);
        if (!info) return;

        const fmLines = getFrontmatterLineCount(info.text);

        // Skip sections that are part of the frontmatter
        if (info.lineStart < fmLines) return;

        let lineNumber = info.lineStart + 1;

        if (this.settings.countFromContent) {
          lineNumber = info.lineStart - fmLines + 1;
        }

        const gutter = document.createElement("span");
        gutter.className = "rv-line-number";
        gutter.setText(String(lineNumber));

        element.prepend(gutter);
      }
    );

    this.registerDomEvent(document, "contextmenu", (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (!target.closest(".markdown-preview-view")) return;

      let targetLeaf: WorkspaceLeaf | null = null;
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (targetLeaf) return;
        if (
          leaf.view instanceof MarkdownView &&
          leaf.view.getMode() === "preview" &&
          leaf.view.previewMode.containerEl.contains(target)
        ) {
          targetLeaf = leaf;
        }
      });
      if (!targetLeaf) return;

      const view = (targetLeaf as WorkspaceLeaf).view as MarkdownView;
      const containerEl = view.previewMode.containerEl;
      const isEnabled = this.settings.enabled !== this.leafOverrides.has(containerEl);

      const menu = new Menu();
      menu.addItem((item) =>
        item
          .setTitle(isEnabled ? "Hide line numbers" : "Show line numbers")
          .setIcon("list-ordered")
          .onClick(() => {
            if (this.leafOverrides.has(containerEl)) {
              this.leafOverrides.delete(containerEl);
            } else {
              this.leafOverrides.add(containerEl);
            }
            view.previewMode.rerender(true);
          })
      );
      menu.showAtMouseEvent(evt);
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file, source, leaf) => {
        // Tab right-click: leaf is provided directly
        if (leaf && leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview") {
          const containerEl = leaf.view.previewMode.containerEl;
          const isEnabled = this.settings.enabled !== this.leafOverrides.has(containerEl);
          this.addToggleMenuItem(menu, isEnabled, () => {
            if (this.leafOverrides.has(containerEl)) {
              this.leafOverrides.delete(containerEl);
            } else {
              this.leafOverrides.add(containerEl);
            }
            (leaf.view as MarkdownView).previewMode.rerender(true);
          });
          return;
        }

        // File navigator right-click: find all preview leaves for this file
        if (!(file instanceof TFile)) return;
        const previewLeaves: WorkspaceLeaf[] = [];
        this.app.workspace.iterateAllLeaves((l) => {
          if (
            l.view instanceof MarkdownView &&
            l.view.getMode() === "preview" &&
            l.view.file?.path === file.path
          ) {
            previewLeaves.push(l);
          }
        });
        if (previewLeaves.length === 0) return;

        const firstContainer = (previewLeaves[0].view as MarkdownView).previewMode.containerEl;
        const isEnabled = this.settings.enabled !== this.leafOverrides.has(firstContainer);
        this.addToggleMenuItem(menu, isEnabled, () => {
          previewLeaves.forEach((l) => {
            const containerEl = (l.view as MarkdownView).previewMode.containerEl;
            if (this.leafOverrides.has(containerEl)) {
              this.leafOverrides.delete(containerEl);
            } else {
              this.leafOverrides.add(containerEl);
            }
            (l.view as MarkdownView).previewMode.rerender(true);
          });
        });
      })
    );
  }

  private addToggleMenuItem(menu: Menu, isEnabled: boolean, onClick: () => void) {
    menu.addItem((item) =>
      item
        .setTitle(isEnabled ? "Hide line numbers" : "Show line numbers")
        .setIcon("list-ordered")
        .onClick(onClick)
    );
  }

  rerenderAllPreviews() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview") {
        leaf.view.previewMode.rerender(true);
      }
    });
  }
}

function getFrontmatterLineCount(text: string): number {
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) return 0;
  return match[0].split(/\r?\n/).length - 1;
}
