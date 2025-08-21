import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  Email,
  Phone,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import { roomsAPI, inquiriesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SimpleRoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    message: '',
    moveInDate: '',
    duration: ''
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRoom = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await roomsAPI.getRoom(id);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      setAlert({ type: 'error', message: 'Failed to load room details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const handleInquirySubmit = async () => {
    if (!room || !user) return;

    try {
      setInquiryLoading(true);
      await inquiriesAPI.createInquiry({
        roomId: room._id,
        message: inquiryData.message,
        moveInDate: inquiryData.moveInDate,
        stayDuration: inquiryData.duration
      });
      
      setAlert({ type: 'success', message: 'Inquiry sent successfully!' });
      setInquiryOpen(false);
      setInquiryData({ message: '', moveInDate: '', duration: '' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setAlert({ type: 'error', message: 'Failed to send inquiry' });
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading room details...</Typography>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Room not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        {/* Images and Details */}
        <Box sx={{ flex: 2 }}>
          <Box sx={{ mb: 3 }}>
            {room.images.length > 0 ? (
              <img
                src={room.images[0].url}
                alt={room.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '400px',
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1
                }}
              >
                <Typography color="text.secondary">No image available</Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {room.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="action" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {room.location.address}, {room.location.city}, {room.location.state} {room.location.zipCode}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip label={room.roomType} color="primary" />
            <Chip 
              label={room.availability.available ? 'Available' : 'Not Available'} 
              color={room.availability.available ? 'success' : 'error'} 
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {room.description}
          </Typography>

          {room.amenities.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {room.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" size="small" />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Contact Card */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Owner
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {room.owner.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{room.owner.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Room Owner
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" color="primary">
                  ${room.price}/month
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{room.owner.email}</Typography>
                </Box>
                
                {room.owner.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{room.owner.phone}</Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {user ? (
                user.role === 'owner' && user._id === room.owner._id ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    This is your room listing
                  </Typography>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setInquiryOpen(true)}
                    disabled={!room.availability.available}
                  >
                    Send Inquiry
                  </Button>
                )
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Login to Contact
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={inquiryData.message}
              onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell the owner about yourself and why you're interested in this room..."
            />
            
            <TextField
              fullWidth
              type="date"
              label="Preferred Move-in Date"
              value={inquiryData.moveInDate}
              onChange={(e) => setInquiryData(prev => ({ ...prev, moveInDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={inquiryData.duration}
                label="Duration"
                onChange={(e) => setInquiryData(prev => ({ ...prev, duration: e.target.value }))}
              >
                <MenuItem value="1-3 months">1-3 months</MenuItem>
                <MenuItem value="3-6 months">3-6 months</MenuItem>
                <MenuItem value="6-12 months">6-12 months</MenuItem>
                <MenuItem value="1+ years">1+ years</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleInquirySubmit} 
            variant="contained"
            disabled={inquiryLoading || !inquiryData.message}
          >
            {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleRoomDetail;