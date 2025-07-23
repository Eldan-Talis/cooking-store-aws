import React, { useState, useEffect } from "react";
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
import { getUsersFromCognito, mapCognitoStatusToDisplay, getStatusColor, type CognitoUser } from "../API/getUsers";

// Mock user data as fallback - in a real app, this would come from your backend
const mockUsers = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-03-20",
    recipesCount: 12,
    favoritesCount: 8
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane@example.com",
    role: "admin",
    status: "active",
    joinDate: "2024-01-10",
    lastLogin: "2024-03-21",
    recipesCount: 25,
    favoritesCount: 15
  },
  {
    id: "3",
    username: "mike_wilson",
    email: "mike@example.com",
    role: "user",
    status: "inactive",
    joinDate: "2024-02-01",
    lastLogin: "2024-02-28",
    recipesCount: 3,
    favoritesCount: 2
  },
  {
    id: "4",
    username: "sarah_jones",
    email: "sarah@example.com",
    role: "user",
    status: "active",
    joinDate: "2024-03-01",
    lastLogin: "2024-03-21",
    recipesCount: 7,
    favoritesCount: 12
  }
];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [cognitoUsers, setCognitoUsers] = useState<CognitoUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [useCognitoData, setUseCognitoData] = useState(false);

  // Check if current user is admin (in real app, check user role from backend)
  const isAdmin = user?.email === "jane@example.com";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Try to fetch from Cognito first
        const cognitoData = await getUsersFromCognito();
        setCognitoUsers(cognitoData);
        setUseCognitoData(true);
      } catch (error) {
        console.log("Using mock data as fallback:", error);
        setUseCognitoData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Combine Cognito and mock data
  const allUsers = useCognitoData ? cognitoUsers.map(cognitoUser => ({
    id: cognitoUser.id,
    username: cognitoUser.username,
    email: cognitoUser.email,
    role: cognitoUser.attributes.role || "user",
    status: mapCognitoStatusToDisplay(cognitoUser.status),
    joinDate: cognitoUser.userCreateDate.toLocaleDateString(),
    lastLogin: cognitoUser.lastLoginDate?.toLocaleDateString() || "Never",
    recipesCount: 0, // You would get this from your database
    favoritesCount: 0 // You would get this from your database
  })) : users;

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getStatusColorLocal = (status) => {
    return getStatusColor(status);
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
      <Typography
        variant="h3"
        align="center"
        sx={{
          color: "#1976d2",
          fontWeight: 800,
          letterSpacing: 1,
          textShadow: "0 2px 8px rgba(25,118,210,0.10)",
          mb: 4,
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
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
            <Typography variant="h4" color="success.main">
              {users.filter(u => u.status === "active").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
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
              {users.reduce((sum, user) => sum + user.recipesCount, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Recipes
            </Typography>
          </CardContent>
        </Card>
      </Box>

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
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
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
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColorLocal(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{user.recipesCount}</TableCell>
                      <TableCell>{user.favoritesCount}</TableCell>
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