import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Download, Share, Check, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-display">Install Zira EduSuite</CardTitle>
          <CardDescription>
            Get quick access to your school management system right from your home screen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Zira EduSuite is already installed on your device!
              </p>
              <Button className="w-full" onClick={() => navigate('/')}>
                Open App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium">To install on iOS:</p>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                    Tap the <Share className="h-4 w-4 inline mx-1" /> Share button in Safari
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                    Scroll down and tap "Add to Home Screen"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                    Tap "Add" to confirm
                  </li>
                </ol>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Smartphone className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Ready to install</p>
                  <p className="text-sm text-muted-foreground">
                    Add to your home screen for quick access
                  </p>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleInstall}>
                <Download className="h-4 w-4" />
                Install Now
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Open this page in your mobile browser to install the app
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Continue to App
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">APP FEATURES</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Works offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Fast loading
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Push notifications
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Home screen access
              </li>
            </ul>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            <X className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
