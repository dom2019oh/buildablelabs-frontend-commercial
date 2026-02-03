import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";

type TabType = "recent" | "my-projects" | "templates";

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const { projects, isLoading } = useProjects();

  const tabs = [
    { id: "recent" as TabType, label: "Recently viewed" },
    { id: "my-projects" as TabType, label: "My projects" },
    { id: "templates" as TabType, label: "Templates" },
  ];

  // Sort by updated_at for recent, created_at for my-projects
  const sortedProjects = [...(projects || [])].sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full max-w-7xl mx-auto px-6 pb-32"
    >
      {/* Container with grey rounded border */}
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8">
        {/* Header with tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 bg-zinc-900 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-zinc-800 rounded-xl mb-4" />
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create your first project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                to={`/dashboard/project/${project.id}`}
                className="group block"
              >
                {/* Project Preview */}
                <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden mb-4 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  {project.preview_html ? (
                    <div
                      className="w-full h-full scale-50 origin-top-left"
                      style={{ width: "200%", height: "200%" }}
                      dangerouslySetInnerHTML={{ __html: project.preview_html }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-zinc-700">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Published Badge */}
                  {project.deployed_url && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-900/90 backdrop-blur-sm rounded-md text-xs text-muted-foreground">
                      Published
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {project.name}
                      </h3>
                      {project.deployed_url && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full flex-shrink-0">
                          Website
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Viewed {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
