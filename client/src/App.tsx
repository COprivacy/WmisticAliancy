import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Rankings from "@/pages/rankings";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import Rewards from "@/pages/rewards"; // Added import for Rewards
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      <Route path="/rankings">
        <Layout>
          <Rankings />
        </Layout>
      </Route>

      <Route path="/admin">
        <Layout>
          <Admin />
        </Layout>
      </Route>

      <Route path="/player/:accountId/:zoneId">
        <Layout>
          <Profile />
        </Layout>
      </Route>

      <Route path="/rewards">
        <Layout>
          <Rewards />
        </Layout>
      </Route>


      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
