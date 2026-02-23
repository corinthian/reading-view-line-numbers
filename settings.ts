import { App, MarkdownView, PluginSettingTab, Setting } from "obsidian";
import type ReadingLineNumbersPlugin from "./main";

export interface ReadingLineNumbersSettings {
  enabled: boolean;
}

export const DEFAULT_SETTINGS: ReadingLineNumbersSettings = {
  enabled: true,
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
      .setDesc("Display source-line numbers in the left gutter of Reading View.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveData(this.plugin.settings);
            this.plugin.rerenderAllPreviews();
          })
      );
  }
}
