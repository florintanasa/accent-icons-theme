/* extension.js
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
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';

export default class AccentColorIconsThemeExtension extends Extension {
    _settings;
    _preferences;
    _accentColorChangedId = 0;
    _colorSchemeChangedId = 0;
    iconThemesLight = Object.values({});
    iconThemesDark = Object.values({});

    // Next method is run when the extension is enabled
    enable() {
        // Get the interface settings
        this._settings = new Gio.Settings({
            schema: "org.gnome.desktop.interface",
        });
        // Initializing icon themes
        this.iconThemesDark = Object.values({
            blue: "Fluent-dark",
            teal: "Fluent-teal-dark",
            green: "Fluent-green-dark",
            yellow: "Fluent-yellow-dark",
            orange: "Fluent-orange-dark",
            red: "Fluent-red-dark",
            pink: "Fluent-pink-dark",
            purple: "Fluent-purple-dark",
            slate: "Fluent-grey-dark",
        });
        this.iconThemesLight = Object.values({
            blue: "Fluent-light",
            teal: "Fluent-teal-light",
            green: "Fluent-green-light",
            yellow: "Fluent-yellow-light",
            orange: "Fluent-orange-light",
            red: "Fluent-red-light",
            pink: "Fluent-pink-light",
            purple: "Fluent-purple-light",
            slate: "Fluent-grey-light",
        });
        // Get Preferences
        this._preferences = this.getSettings();
        // Connect to accent color changes
        this._accentColorChangedId = this._settings.connect("changed::accent-color", this._onAccentColorChanged.bind(this));
        // Connect to color scheme changes
        this._colorSchemeChangedId = this._settings.connect("changed::color-scheme", this._onAccentColorChanged.bind(this));
        // Initial theme update
        this._onAccentColorChanged();
    }

    // Next metod is run when the estension is disabled 
    disable() {
        // Disconnect the signal handler
        if (this._settings && this._accentColorChangedId) {
            this._settings.disconnect(this._accentColorChangedId);
            this._accentColorChangedId = 0;
        }
        if (this._preferences && this._colorSchemeChangedId) {
            this._preferences.disconnect(this._colorSchemeChangedId);
            this._colorSchemeChangedId = 0;
        }
        // Clear the iconThemes array
        this.iconThemesLight = [];
        this.iconThemesDark = [];
        // Optionally reset to default icon theme
        this._setIconTheme("Adwaita");
        // Null out settings
        this._settings = null;
        this._preferences = null;
    }

     // Next metod is called when extension is enabled, color accent, edit a new path to the themes, or the switch for set link gtk4 local is changed
    _onAccentColorChanged() {
        if(this._settings?.get_string("color-scheme") === 'prefer-dark')
        {
        // Get the current accent color
        const accentColor = this._settings?.get_string("accent-color") ?? "blue";
        // Get custom theme from preferences
        const customTheme = this._preferences?.get_string(`${accentColor}-theme-dark`);
        // Get the corresponding icon theme or default to Adwaita
        const iconTheme = customTheme || "Adwaita";
        // Set the icon theme
        this._setIconTheme(iconTheme);
        }
        else
        {
        // Get the current accent color
        const accentColor = this._settings?.get_string("accent-color") ?? "blue";
        // Get custom theme from preferences
        const customTheme = this._preferences?.get_string(`${accentColor}-theme-light`);
        // Get the corresponding icon theme or default to Adwaita
        const iconTheme = customTheme || "Adwaita";
        // Set the icon theme
        this._setIconTheme(iconTheme);            
        }

    }

    // Next method set the theme
    _setIconTheme(themeName) {
        // Set the icon theme
        this._settings?.set_string("icon-theme", themeName);
    }
}
