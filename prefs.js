/* prefs.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
export default class AccentDirsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const preferences = this.getSettings();
        const page = new Adw.PreferencesPage({
            title: _('General'),
            iconName: 'dialog-information-symbolic',
        });
        const GeneralGroup = new Adw.PreferencesGroup({
            title: _('General'),
            description: _('Configure General Options'),
        });
        page.add(GeneralGroup);
        const changeAppColors = new Adw.SwitchRow({
            title: _('App Icons'),
            subtitle: _('Match app icons with accent color (Fluent colored icons only).'),
        });
        GeneralGroup.add(changeAppColors);
        // Add custom theme light selection group
        const ThemeGroupLight = new Adw.PreferencesGroup({
            title: _('Custom Icon Themes Light'),
            description: _('Select custom icon themes light for each accent color'),
        });
        page.add(ThemeGroupLight);
        // Get available icon themes light
        const iconThemesLight = this._getAvailableIconThemes();
        // Create dropdown for each accent color
        const accentColorsLight = [
            'blue', 'teal', 'green', 'yellow',
            'orange', 'red', 'pink', 'purple', 'slate'
        ];
        accentColorsLight.forEach(color => {
            const row = new Adw.ComboRow({
                title: _(color.charAt(0).toUpperCase() + color.slice(1)),
                model: this._createIconThemeModel(iconThemesLight),
                selected: this._getSelectedIndexLight(preferences, color, iconThemesLight)
            });
            row.connect('notify::selected', () => {
                const selected = iconThemesLight[row.selected];
                preferences.set_string(`${color}-theme-light`, selected);
            });
            ThemeGroupLight.add(row);
        });
        // Add custom theme dark selection group
        const ThemeGroupDark = new Adw.PreferencesGroup({
            title: _('Custom Icon Themes Dark'),
            description: _('Select custom icon themes dark for each accent color'),
        });
        page.add(ThemeGroupDark);
        // Get available icon themes dark
        const iconThemesDark = this._getAvailableIconThemes();
        // Create dropdown for each accent color
        const accentColorsDark = [
            'blue', 'teal', 'green', 'yellow',
            'orange', 'red', 'pink', 'purple', 'slate'
        ];
        accentColorsDark.forEach(color => {
            const row = new Adw.ComboRow({
                title: _(color.charAt(0).toUpperCase() + color.slice(1)),
                model: this._createIconThemeModel(iconThemesDark),
                selected: this._getSelectedIndexDark(preferences, color, iconThemesDark)
            });
            row.connect('notify::selected', () => {
                const selected = iconThemesDark[row.selected];
                preferences.set_string(`${color}-theme-dark`, selected);
            });
            ThemeGroupDark.add(row);
        });
        window.add(page);
        preferences.bind('change-app-colors', changeAppColors, 'active', Gio.SettingsBindFlags.DEFAULT);
        return Promise.resolve();
    }
    _getAvailableIconThemes() {
        const themes = new Set();
        const directories = [
            '/usr/local/share/icons',
            '/usr/share/icons',
            GLib.get_home_dir() + '/.local/share/icons',
            GLib.get_home_dir() + '/.icons'
        ];
        // Scan directories for icon themes
        directories.forEach(dir => {
            if (GLib.file_test(dir, GLib.FileTest.IS_DIR)) {
                const directory = Gio.File.new_for_path(dir);
                const enumerator = directory.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
                let info;
                while ((info = enumerator.next_file(null))) {
                    const path = dir + '/' + info.get_name();
                    if (this._isValidIconTheme(path)) {
                        themes.add(info.get_name());
                    }
                }
            }
        });
        return Array.from(themes).sort();
    }
    _isValidIconTheme(path) {
        return GLib.file_test(path + '/index.theme', GLib.FileTest.EXISTS);
    }
    _createIconThemeModel(themes) {
        return new Gtk.StringList({ strings: themes });
    }
    _getSelectedIndexLight(preferences, color, themes) {
        const savedTheme = preferences.get_string(`${color}-theme-light`);
        const theme = savedTheme;
        return Math.max(0, themes.indexOf(theme));
    }
    _getSelectedIndexDark(preferences, color, themes) {
        const savedTheme = preferences.get_string(`${color}-theme-dark`);
        const theme = savedTheme;
        return Math.max(0, themes.indexOf(theme));
    }
}
