import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MousePointer,
  Save,
  Download,
  Upload,
  Trash2,
  Monitor,
  Calculator,
} from "lucide-react";
import { type NumberNotation } from "@/lib/format-number";
import { HelpModal } from "./help-modal";

interface SettingsPanelProps {
  autoBuy: "OFF" | "x1" | "xNext";
  setAutoBuy: (val: "OFF" | "x1" | "xNext") => void;
  clickLimiterEnabled: boolean;
  setClickLimiterEnabled: (val: boolean) => void;
  lowPerformanceMode: boolean;
  setLowPerformanceMode: (val: boolean) => void;
  showFloatingText: boolean;
  setShowFloatingText: (val: boolean) => void;
  toastsEnabled: boolean;
  setToastsEnabled: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  numberNotation: NumberNotation;
  setNumberNotation: (val: NumberNotation) => void;
  isLocalhost: boolean;
  onManualSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onHardReset: () => void;
}

export function SettingsPanel({
  autoBuy,
  setAutoBuy,
  clickLimiterEnabled,
  setClickLimiterEnabled,
  lowPerformanceMode,
  setLowPerformanceMode,
  showFloatingText,
  setShowFloatingText,
  toastsEnabled,
  setToastsEnabled,
  soundEnabled,
  setSoundEnabled,
  numberNotation,
  setNumberNotation,
  isLocalhost,
  onManualSave,
  onExport,
  onImport,
  onHardReset,
}: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {/* Gameplay Settings */}
        <div className="space-y-2 p-4 border rounded-lg bg-card/50">
          <HelpModal />
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 mt-2">
            Gameplay
          </h3>
          <Button
            className="w-full justify-between"
            variant={autoBuy !== "OFF" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setAutoBuy(
                autoBuy === "OFF" ? "x1" : autoBuy === "x1" ? "xNext" : "OFF",
              )
            }
          >
            <span>Auto-Buy</span>
            <span className="font-mono">{autoBuy}</span>
          </Button>

          {isLocalhost && (
            <Button
              className="w-full justify-between"
              variant={clickLimiterEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setClickLimiterEnabled(!clickLimiterEnabled)}
              title={clickLimiterEnabled ? "Limit: 12 CPS" : "No Limit"}
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-3 h-3" />
                <span>Anti-Cheat</span>
              </div>
              <span className="font-mono">
                {clickLimiterEnabled ? "ON" : "OFF"}
              </span>
            </Button>
          )}
        </div>

        {/* Graphics & Performance */}
        <div className="space-y-2 p-4 border rounded-lg bg-card/50">
          <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground mb-2">
            <Monitor className="w-4 h-4" />
            Graphics & Performance
          </h3>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <Label
                htmlFor="sound-enabled"
                className="text-base cursor-pointer"
              >
                Sound Effects
              </Label>
              <div className="text-xs text-muted-foreground">
                Enable game audio (SFX).
              </div>
            </div>
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <Label
                htmlFor="low-perf-mode"
                className="text-base cursor-pointer"
              >
                Low Performance Mode
              </Label>
              <div className="text-xs text-muted-foreground">
                Reduces update frequency to save battery.
              </div>
            </div>
            <Switch
              id="low-perf-mode"
              checked={lowPerformanceMode}
              onCheckedChange={setLowPerformanceMode}
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <Label
                htmlFor="show-floating-text"
                className="text-base cursor-pointer"
              >
                Floating Text
              </Label>
              <div className="text-xs text-muted-foreground">
                Show numbers when clicking/lifting.
              </div>
            </div>
            <Switch
              id="show-floating-text"
              checked={showFloatingText}
              onCheckedChange={setShowFloatingText}
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <Label
                htmlFor="toasts-enabled"
                className="text-base cursor-pointer"
              >
                Notifications
              </Label>
              <div className="text-xs text-muted-foreground">
                Show popup messages for saves/events.
              </div>
            </div>
            <Switch
              id="toasts-enabled"
              checked={toastsEnabled}
              onCheckedChange={setToastsEnabled}
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base">Number Notation</Label>
              <div className="text-xs text-muted-foreground">
                Format for large numbers.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNumberNotation(
                  numberNotation === "standard" ? "scientific" : "standard",
                )
              }
              className="min-w-25"
            >
              <Calculator className="w-3 h-3 mr-2" />
              {numberNotation === "standard" ? "Standard" : "Scientific"}
            </Button>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-2 p-4 border rounded-lg bg-card/50">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            Data Management
          </h3>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={onManualSave}
              title="Manual Save"
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Game</span>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={onExport}
              title="Export Save"
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={onImport}
              title="Import Save"
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </div>
            </Button>
            <Button
              variant="destructive"
              onClick={onHardReset}
              title="Hard Reset (Wipe Save)"
              className="w-full justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Hard Reset</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
