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
      <Route path="/">
        <HomeWithDeckProvider />
      </Route>
      <Route path="/admin">
        <AdminPage />
      </Route>
      <Route path="/add-character">
        <AddCharacterPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// DeckProviderでラップしたHomeコンポーネント
function HomeWithDeckProvider() {
  return (
    <DeckProvider>
      <Home />
    </DeckProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
