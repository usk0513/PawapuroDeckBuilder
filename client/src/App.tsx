import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeckProvider } from "@/contexts/DeckContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminPage from "@/pages/AdminPage";
import AddCharacterPage from "@/pages/AddCharacterPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/add-character" component={AddCharacterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DeckProvider>
          <Toaster />
          <Router />
        </DeckProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
