import DashboardLayout from "@/components/DashboardLayout";
import GlobalLayout from "@/components/GlobalLayout";
import Protect from "@/components/Protect";
import Providers from "@/lib/providers";

// If loading a variable font, you don't need to specify the font weight

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Protect>
        <GlobalLayout>{children}</GlobalLayout>
      </Protect>
    </Providers>
  );
}
