import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <HelpCircle className="w-4 h-4" />
          Game Guide / Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gym Clicker: Ultimate Guide</DialogTitle>
          <DialogDescription>
            Learn how to become the strongest lifter in the universe.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-2">Build Your Muscles</h3>
              <p className="text-muted-foreground">
                Tapping the Lift button (or pressing Space/Enter) generates{" "}
                <strong>Calories</strong> and gains <strong>Lifts</strong>.
                Calories are your primary currency. Use them to buy upgrades in
                the <strong>Train</strong> tab.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                Training (Upgrades)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <strong>Lift Upgrades:</strong> Increase the calories you get
                  per click.
                </li>
                <li>
                  <strong>Diet (Passive):</strong> Generates calories
                  automatically over time.
                </li>
                <li>
                  <strong>Multipliers:</strong> Power-ups that boost your gains
                  exponentially.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Gear & Equipment</h3>
              <p className="text-muted-foreground mb-2">
                In the <strong>Gear</strong> tab, you can find powerful one-time
                bonuses:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <strong>Milestones:</strong> Permanent boosts to lift power,
                  passive income, and more.
                </li>
                <li>
                  <strong>Equipment:</strong> Specialized gear that adds huge
                  multipliers.
                </li>
                <li>
                  <strong>Gym Upgrades:</strong> Unlock new locations for
                  massive global multipliers.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Gym Bros</h3>
              <p className="text-muted-foreground">
                Hire <strong>Gym Bros</strong> to automate your lifting! Each
                Bro provides unique bonuses like Crit Chance, Speed, or pure
                Passive Income multipliers.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Combo System</h3>
              <p className="text-muted-foreground">
                Lifting quickly builds your <strong>Combo Meter</strong>.
                <br />
                Higher combo = More Damage Bonus (2% per stack).
                <br />
                <strong>Tip:</strong> Buy &quot;Combo Max&quot; upgrades in the
                Gear tab to extend your max combo from 10 all the way to 100!
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Prestige Layers</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>1. Competition (Prestige):</strong> Reset your
                  progress for <strong>Protein Points (PP)</strong>. Boosts all
                  future gains.
                </p>
                <p>
                  <strong>2. Pro Card (Ascension):</strong> A harder reset that
                  grants <strong>Titan Tokens (TT)</strong>. Unlocks powerful
                  new mechanics.
                </p>
                <p>
                  <strong>3. Mr. Olympia (Transcendence):</strong> The ultimate
                  reset. Grants <strong>Divinity Points</strong> for god-like
                  power.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm text-muted-foreground">
                <div className="col-span-2 font-medium text-foreground mt-2 border-b pb-1">
                  Actions
                </div>
                <div>
                  <kbd className="px-1 bg-muted rounded">Space</kbd>
                </div>
                <div>Lift Weights</div>
                <div>
                  <kbd className="px-1 bg-muted rounded">B</kbd>
                </div>
                <div>Buy All (Current Tab)</div>
                <div>
                  <kbd className="px-1 bg-muted rounded">S</kbd>
                </div>
                <div>Manual Save</div>

                <div className="col-span-2 font-medium text-foreground mt-2 border-b pb-1">
                  Navigation
                </div>
                <div>
                  <kbd className="px-1 bg-muted rounded">Q</kbd> -{" "}
                  <kbd className="px-1 bg-muted rounded">P</kbd>
                </div>
                <div>Switch Main Tabs</div>
                <div>
                  <kbd className="px-1 bg-muted rounded">1</kbd> -{" "}
                  <kbd className="px-1 bg-muted rounded">4</kbd>
                </div>
                <div>Switch Sub-Tabs (Train/Gear)</div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
