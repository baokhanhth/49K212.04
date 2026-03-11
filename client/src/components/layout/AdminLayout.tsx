import SidebarAdmin from "./SidebarAdmin";

interface Props {
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#111827] p-3">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1450px] overflow-hidden rounded-[28px] bg-[#E9EDF5] shadow-2xl">
        
        <SidebarAdmin />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;