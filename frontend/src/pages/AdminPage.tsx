import React, { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { getUsersFromDatabase, useDatabaseUsers, type DatabaseUser } from "../API/getUsers";




export default function AdminPage() {
  const { user } = useAuth();
  const { fetchUsers } = useDatabaseUsers();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin (in real app, check user role from backend)
  /* Is current logged-in user in the Admin group? */
  const isAdmin = useMemo(() => {
    console.log("Calculating isAdmin - user groups:", user?.groups);
    return user?.groups?.includes("Admin") ?? false;
  }, [user?.groups]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const databaseUsers = await fetchUsers();
        setUsers(databaseUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch users");
        setUsers([]); // No fallback - only real data
      } finally {
        setLoading(false);
      }
    };

    if (user?.idToken) {
      loadUsers();
    }
  }, [fetchUsers, user?.idToken]);

  const filteredUsers = users.filter(user =>
    (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (userId) => {
    // In a real app, this would call your backend API
    setUsers(users.filter(user => user.id !== userId));
  };



  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "user":
        return "primary";
      default:
        return "default";
    }
  };

  if (!user) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Please log in to access admin panel
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied: You don't have admin privileges
        </Alert>
        <Typography variant="h5" color="text.secondary">
          This page is only accessible to administrators
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 1400, margin: "0 auto" }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <AdminIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {users.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="error.main">
              {users.filter(u => u.role === "admin").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrators
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="warning.main">
              {users.reduce((sum, user) => sum + (user.recipesCount || 0), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Recipes
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary">
          Add New User
        </Button>
      </Box>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography variant="h6" color="text.secondary">
                {error ? "Failed to load users" : "No users found"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Join Date</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell>Recipes</TableCell>
                      <TableCell>Favorites</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {user.username}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{user.recipesCount || 0}</TableCell>
                      <TableCell>{user.favoritesCount || 0}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 