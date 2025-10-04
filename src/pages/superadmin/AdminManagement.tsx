import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Plus, Trash2, Search, Filter } from "lucide-react";
import { fetchUsers, deleteUser } from "../../store/feature/Auth/AuthSlice";
import type { RootState } from "../../store";
import DynamicTable from "../../components/DynamicTable";

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { users, usersLoading } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteAdmin = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await dispatch(deleteUser(id) as any).unwrap();
      } catch (error: any) {
        console.error("Failed to delete admin:", error);
        alert("Failed to delete admin");
      }
    }
  };

  // Filtering
  const filteredAdmins = users.filter((admin) => {
    const matchesSearch =
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || admin.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + itemsPerPage);

  // DynamicTable columns
  const columns = [
    {
      key: "admin",
      label: "Admin",
      render: (_: any, admin: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-800">{admin.username}</div>
            <div className="text-sm text-gray-500">{admin.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (_: any, admin: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
          {admin.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, admin: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(admin.isActive)}`}>
          {admin.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (_: any, admin: any) => new Date(admin.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, admin: any) => (
        <div className="flex items-center justify-end space-x-2">
          {/* Edit button placeholder */}
          <button
            onClick={() => {}}
            className="text-green-600 hover:text-green-900 p-1"
          >
            {/* <Edit className="w-4 h-4" /> */}
          </button>
          {admin.role !== "SUPER_ADMIN" && (
            <button
              onClick={() => handleDeleteAdmin(admin.id)}
              className="text-red-600 hover:text-red-900 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
            <p className="text-gray-600">Manage admin accounts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset pagination on search
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value as "ALL" | "SUPER_ADMIN" | "ADMIN");
                setCurrentPage(1); // reset pagination on filter
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admins List with DynamicTable */}
      <DynamicTable
        columns={columns}
        data={paginatedAdmins}
        label="Admins"
        rowKey="id"
        pagination={{
          current: currentPage,
          total: filteredAdmins.length,
          pageSize: itemsPerPage,
        }}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter((admin) => admin.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Regular Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter((admin) => admin.role === "ADMIN").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
