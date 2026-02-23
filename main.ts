import { MarkdownPostProcessorContext, MarkdownView, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  ReadingLineNumbersSettings,
  ReadingLineNumbersSettingTab,
} from "./settings";

export default class ReadingLineNumbersPlugin extends Plugin {
  settings: ReadingLineNumbersSettings;

  async onload() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );

    this.addSettingTab(new ReadingLineNumbersSettingTab(this.app, this));

    this.registerMarkdownPostProcessor(
      (element: HTMLElement, context: MarkdownPostProcessorContext) => {
        if (!this.settings.enabled) return;

        const info = context.getSectionInfo(element);
        if (!info) return;

        const lineNumber = info.lineStart + 1;

        const gutter = document.createElement("span");
        gutter.className = "rv-line-number";
        gutter.setText(String(lineNumber));

        element.prepend(gutter);
      }
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
