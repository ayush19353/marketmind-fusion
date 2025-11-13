import { Button } from "@/components/ui/button";
import { GraduationCap, Microscope } from "lucide-react";

type Mode = "guided" | "expert";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "guided" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("guided")}
        className="gap-2"
      >
        <GraduationCap className="h-4 w-4" />
        Guided
      </Button>
      <Button
        variant={mode === "expert" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("expert")}
        className="gap-2"
      >
        <Microscope className="h-4 w-4" />
        Expert
      </Button>
    </div>
  );
};
