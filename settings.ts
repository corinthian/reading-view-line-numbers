import { App, MarkdownView, PluginSettingTab, Setting } from "obsidian";
import type ReadingLineNumbersPlugin from "./main";

export interface ReadingLineNumbersSettings {
  enabled: boolean;
  countFromContent: boolean;
}

export const DEFAULT_SETTINGS: ReadingLineNumbersSettings = {
  enabled: true,
  countFromContent: false,
};

export class ReadingLineNumbersSettingTab extends PluginSettingTab {
  plugin: ReadingLineNumbersPlugin;

  constructor(app: App, plugin: ReadingLineNumbersPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Show line numbers in Reading View")
      .setDesc("Default state when opening a file in Reading View. Right-click any reading view to override per window.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveData(this.plugin.settings);
            this.plugin.rerenderAllPreviews();
          })
      );

    new Setting(containerEl)
      .setName("Count from first content line")
      .setDesc("Start numbering at 1 from the first line after frontmatter. Off = number from line 1 of the full document.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.countFromContent)
          .onChange(async (value) => {
            this.plugin.settings.countFromContent = value;
            await this.plugin.saveData(this.plugin.settings);
            this.plugin.rerenderAllPreviews();
          })
      );
  }
}
