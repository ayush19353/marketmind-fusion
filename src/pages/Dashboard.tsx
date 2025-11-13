import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight, LogOut, Archive, Copy, ArchiveRestore, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "guided" | "expert";

const steps = [
  { id: "product", label: "Product Input", path: "/product-input", description: "Input your product idea" },
  { id: "hypothesis", label: "Hypotheses", path: "/hypothesis", description: "AI-generated hypotheses" },
  { id: "plan", label: "Research Plan", path: "/research-plan", description: "Complete research strategy" },
  { id: "instruments", label: "AI Instruments", path: "/instruments", description: "Survey & interview designer" },
  { id: "collection", label: "Data Insights", path: "/data-insights", description: "Collect & analyze responses" },
  { id: "analysis", label: "AI Analysis", path: "/analysis", description: "Deep insights & segmentation" },
  { id: "report", label: "AI Report", path: "/report", description: "Executive insights report" },
  { id: "optimization", label: "Marketing Studio", path: "/marketing-studio", description: "GenAI marketing assets" },
];

const Dashboard = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const [userEmail, setUserEmail] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    fetchUser();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .select('*')
        .eq('archived', viewMode === "archived")
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    setIsLoadingProjects(true);
    fetchProjects();
  }, [viewMode]);

  const handleArchive = async (projectId: string, archived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('research_projects')
        .update({ archived })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: archived ? "Project archived" : "Project restored",
        description: archived ? "Project moved to archive" : "Project restored to active projects",
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error archiving project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data, error } = await supabase.functions.invoke('duplicate-project', {
        body: { projectId }
      });

      if (error) throw error;

      toast({
        title: "Project duplicated",
        description: "A copy of the project has been created",
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error duplicating project:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate project",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  const handleProjectClick = (project: any) => {
    if (project.status === 'draft') {
      navigate("/product-input");
    } else if (project.status === 'in_progress') {
      navigate("/hypothesis", {
        state: {
          projectId: project.id,
          productName: project.product_name,
          productDescription: project.product_description,
          mode: project.mode
        }
      });
    } else {
      navigate("/research-plan", {
        state: {
          projectId: project.id,
          productName: project.product_name,
          productDescription: project.product_description,
          mode: project.mode
        }
      });
    }
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter === "all") return true;
    return project.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Research Dashboard</h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} onModeChange={setMode} />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Your Research Hub</CardTitle>
              <CardDescription className="text-base">
                {mode === "guided" 
                  ? "Follow our step-by-step process to conduct complete marketing research — no expertise needed."
                  : "Access advanced research tools and technical controls for comprehensive analysis."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="lg" onClick={() => navigate("/product-input")}>
                Start New Research Project
              </Button>
            </CardContent>
          </Card>

          {/* Project Management Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "active" | "archived")} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="active">Active Projects</TabsTrigger>
                <TabsTrigger value="archived">Archived Projects</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoadingProjects ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">
                    {viewMode === "archived" 
                      ? "No archived projects" 
                      : statusFilter === "all"
                        ? "No projects yet. Create your first project to get started."
                        : `No ${statusFilter.replace('_', ' ')} projects`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:shadow-medium transition-all duration-300 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.product_name}</CardTitle>
                        <Badge variant={
                          project.status === 'completed' ? 'default' :
                          project.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.product_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicate(project.id, e)}
                            title="Duplicate project"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleArchive(project.id, !project.archived, e)}
                            title={project.archived ? "Restore project" : "Archive project"}
                          >
                            {project.archived ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Research Workflow */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Research Workflow</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <Card
                  key={step.id}
                  className="group transition-all duration-300 hover:shadow-medium hover:border-primary/50 cursor-pointer"
                  onClick={() => navigate(step.path)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.label}</CardTitle>
                          <CardDescription className="text-xs mt-1">{step.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Analysis Methods</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-secondary">AI-Powered</div>
                  <div className="text-sm text-muted-foreground">Automation</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-accent">Real-Time</div>
                  <div className="text-sm text-muted-foreground">Insights</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">End-to-End</div>
                  <div className="text-sm text-muted-foreground">Optimization</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
