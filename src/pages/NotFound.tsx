import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Home, ArrowLeft, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navigation/Navbar";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar 
        backTo="/main" 
        breadcrumbs={[
          { label: 'Home', href: '/' }, 
          { label: 'Page Not Found' }
        ]} 
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-md w-full p-8 sm:p-10 text-center border-border/80 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">
              Error 404
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Off the Beaten Path
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We couldn't locate the page you requested at <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">{location.pathname}</code>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => navigate('/main')} 
              className="flex-1 gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Page
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default NotFound;

