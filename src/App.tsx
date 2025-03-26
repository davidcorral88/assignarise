
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import TaskForm from "./pages/TaskForm";
import UserList from "./pages/UserList";
import UserForm from "./pages/UserForm";
import TimeTracking from "./pages/TimeTracking";
import CalendarView from "./pages/CalendarView";
import WorkScheduleConfig from "./pages/WorkScheduleConfig";
import UserVacations from "./pages/UserVacations";
import UserConfig from "./pages/UserConfig";
import Settings from "./pages/Settings";
import Calendars from "./pages/Calendars";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/:id/edit" element={<TaskForm />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/calendars" element={<Calendars />} />
            <Route path="/work-schedule" element={<WorkScheduleConfig />} />
            <Route path="/vacations" element={<UserVacations />} />
            <Route path="/config" element={<UserConfig />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
