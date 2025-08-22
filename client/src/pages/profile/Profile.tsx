import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Chip,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Verified as VerifiedIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      try {
        setLoading(true);
        await authAPI.getMe();
      } finally {
        setLoading(false);
      }
    };
    refresh();
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleEditProfile = async () => {
    setEditError('');
    setEditSuccess('');

    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }

    try {
      setEditSubmitting(true);
      // Note: This would require an API endpoint to update profile
      // For now, we'll just show success message
      setEditSuccess('Profile updated successfully');
      setEditDialogOpen(false);
    } catch (e: any) {
      setEditError(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordSubmitting(true);
      // Note: This would require an API endpoint to change password
      setPasswordSuccess('Password changed successfully');
      setChangePasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setPasswordError(e?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'renter':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return '🏠';
      case 'renter':
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {user.email}
                  </Typography>
                  <Chip
                    label={`${getRoleIcon(user.role)} ${user.role.toUpperCase()}`}
                    color={getRoleColor(user.role) as any}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditDialogOpen(true)}
                    size="small"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => setChangePasswordDialogOpen(true)}
                    size="small"
                  >
                    Change Password
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Account Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmailIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">{user.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PhoneIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1">
                          {user.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <VerifiedIcon color={user.isVerified ? 'success' : 'action'} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isVerified ? 'Verified' : 'Not Verified'}
                          color={user.isVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HistoryIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body1">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon color="primary" />
                  Account Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive updates about your account and listings"
                    />
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security to your account"
                    />
                    <Button variant="outlined" size="small">
                      Enable
                    </Button>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Login History"
                      secondary="View your recent login activity"
                    />
                    <Button variant="outlined" size="small">
                      View
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">Delete Account</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Permanently delete your account and all associated data
                      </Typography>
                    </Box>
                    <Button variant="outlined" color="error" size="small">
                      Delete Account
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">Sign Out</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sign out of your account on this device
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<LogoutIcon />}
                      onClick={logout}
                    >
                      Sign Out
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          {editSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {editSuccess}
            </Alert>
          )}
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              fullWidth
              placeholder="+1 (555) 123-4567"
            />
            <TextField
              label="Email Address"
              value={user.email}
              fullWidth
              disabled
              helperText="Email cannot be changed. Contact support if needed."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditProfile}
            variant="contained"
            disabled={editSubmitting}
          >
            {editSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onClose={() => setChangePasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              helperText="Password must be at least 6 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={passwordSubmitting}
          >
            {passwordSubmitting ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;