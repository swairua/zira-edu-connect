import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SettingsBackHeaderProps {
  title: string;
  description?: string;
}

export function SettingsBackHeader({ title, description }: SettingsBackHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link to="/settings">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
