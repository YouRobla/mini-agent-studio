import { AppProviders } from "./app/AppProviders.tsx";
import { AppRoutes } from "./app/AppRoutes.tsx";

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
