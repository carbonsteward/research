import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AdminPage from "@/pages/admin";
import CompanyPage from "@/pages/company";
import InvestorPage from "@/pages/investor";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    // Simple login form - in production this would be a proper auth flow
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              TWIGA Platform
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Admin Access Portal
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                Demo Mode: The platform is ready to use. Authentication will be implemented in production.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={AdminPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/company" component={CompanyPage} />
      <Route path="/investor" component={InvestorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
