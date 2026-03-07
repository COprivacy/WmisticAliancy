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
import Rewards from "@/pages/rewards";
import Meta from "@/pages/meta";
import Fame from "@/pages/fame";
import Arena from "@/pages/arena";
import Rules from "@/pages/rules";
import Chat from "@/pages/chat";
import PrivateChat from "@/pages/private-chat";
import Guide from "@/pages/guide";
import Layout from "@/components/layout";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

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

      <Route path="/meta">
        <Layout>
          <Meta />
        </Layout>
      </Route>

      <Route path="/fame">
        <Layout>
          <Fame />
        </Layout>
      </Route>

      <Route path="/arena">
        <Layout>
          <Arena />
        </Layout>
      </Route>

      <Route path="/rules">
        <Layout>
          <Rules />
        </Layout>
      </Route>

      <Route path="/chat">
        <Layout>
          <Chat />
        </Layout>
      </Route>

      <Route path="/chat/private">
        <Layout>
          <PrivateChat />
        </Layout>
      </Route>

      <Route path="/chat/private/:id/:zone">
        <Layout>
          <PrivateChat />
        </Layout>
      </Route>

      <Route path="/guide">
        <Layout>
          <Guide />
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
          <PwaInstallPrompt />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
