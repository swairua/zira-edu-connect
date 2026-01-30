import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, AlertTriangle } from "lucide-react";
import { useInstitution } from "@/contexts/InstitutionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  getCurriculum, 
  getAllCurricula, 
  getInternationalCurricula,
  type CurriculumId,
  type CurriculumConfig
} from "@/lib/curriculum-config";

export function CurriculumSettingsCard() {
  const { institution, institutionId, refetch } = useInstitution();
  const [isChanging, setIsChanging] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumId | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentCurriculumId = ((institution as any)?.curriculum as CurriculumId) || 'ke_cbc';
  const currentCurriculum = getCurriculum(currentCurriculumId);
  
  const allCurricula = getAllCurricula();
  const internationalCurricula = getInternationalCurricula();
  const nationalCurricula = allCurricula.filter(c => !internationalCurricula.includes(c));

  const handleChangeCurriculum = () => {
    if (selectedCurriculum && selectedCurriculum !== currentCurriculumId) {
      setShowConfirmDialog(true);
    }
  };

  const confirmChange = async () => {
    if (!selectedCurriculum || !institutionId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({ curriculum: selectedCurriculum })
        .eq('id', institutionId);

      if (error) throw error;

      toast.success("Curriculum updated successfully");
      refetch();
      setIsChanging(false);
      setSelectedCurriculum(null);
    } catch (error: any) {
      toast.error("Failed to update curriculum: " + error.message);
    } finally {
      setIsSaving(false);
      setShowConfirmDialog(false);
    }
  };

  const renderCurriculumOption = (curriculum: CurriculumConfig) => (
    <SelectItem key={curriculum.id} value={curriculum.id}>
      <div className="flex items-center gap-2">
        <span>{curriculum.name}</span>
        <span className="text-xs text-muted-foreground">({curriculum.shortName})</span>
      </div>
    </SelectItem>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Curriculum Settings
          </CardTitle>
          <CardDescription>
            The curriculum determines grading scales and educational levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isChanging ? (
            <>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{currentCurriculum?.name}</span>
                    <Badge variant="secondary">{currentCurriculum?.shortName}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentCurriculum?.description}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsChanging(true)}>
                  Change
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Regulatory Body</p>
                  <p className="text-sm font-medium">{currentCurriculum?.regulatoryBody || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Education Levels</p>
                  <p className="text-sm font-medium">{currentCurriculum?.levels.length || 0} levels</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Available Grading Scales
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentCurriculum?.gradingScales.map(scale => (
                    <Badge key={scale.id} variant="outline" className="text-xs">
                      {scale.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Select
                value={selectedCurriculum || currentCurriculumId}
                onValueChange={(value) => setSelectedCurriculum(value as CurriculumId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select curriculum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>National Curricula</SelectLabel>
                    {nationalCurricula.map(renderCurriculumOption)}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>International Curricula</SelectLabel>
                    {internationalCurricula.map(renderCurriculumOption)}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  onClick={handleChangeCurriculum}
                  disabled={!selectedCurriculum || selectedCurriculum === currentCurriculumId}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsChanging(false);
                    setSelectedCurriculum(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Change Curriculum?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing the curriculum will affect how grades are calculated and displayed. 
              Existing grades will remain but may be displayed differently under the new grading system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange} disabled={isSaving}>
              {isSaving ? "Saving..." : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
