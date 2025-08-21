import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  Person,
  Email,
  Phone,
  CalendarToday,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import { roomsAPI, inquiriesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    message: '',
    moveInDate: '',
    stayDuration: 'flexible',
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await roomsAPI.getRoom(id!);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      setError('Room not found');
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setInquiryLoading(true);
    try {
      await inquiriesAPI.createInquiry({
        roomId: room!._id,
        message: inquiryForm.message,
        moveInDate: inquiryForm.moveInDate,
        stayDuration: inquiryForm.stayDuration,
      });
      setInquirySuccess(true);
      setInquiryOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setInquiryLoading(false);
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    const typeMap = {
      per_night: '/night',
      per_week: '/week',
      per_month: '/month',
    };
    return `$${price}${typeMap[priceType as keyof typeof typeMap] || '/month'}`;
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error || !room) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h5" color="error">
          {error || 'Room not found'}
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const isOwner = user?.id === room.owner.id;

  return (
    <Box>
      {inquirySuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your inquiry has been sent successfully!
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Images */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            {room.images.length > 0 ? (
              <img
                src={`http://localhost:12001${room.images[0].url}`}
                alt={room.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}
              >
                <Typography color="text.secondary">No image available</Typography>
              </Box>
            )}
          </Box>

          {/* Room Details */}
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {room.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {room.location.address}, {room.location.city}, {room.location.state} {room.location.zipCode}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" color="primary">
                  {formatPrice(room.price, room.priceType)}
                </Typography>
                <Chip
                  label={room.roomType}
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {room.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {room.amenities.map((amenity) => (
                  <Chip key={amenity} label={amenity} />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>
              <Typography variant="body1">
                Available from: {new Date(room.availability.availableFrom).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                Minimum stay: {room.availability.minimumStay} {room.priceType.replace('per_', '')}(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Card */}
        <Grid item xs={12} md={4}>
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

              {room.contactInfo.showEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">{room.owner.email}</Typography>
                </Box>
              )}

              {room.contactInfo.showPhone && room.owner.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">{room.owner.phone}</Typography>
                </Box>
              )}

              {!isOwner && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setInquiryOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Send Inquiry
                </Button>
              )}

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Views: {room.views}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Inquiry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={inquiryForm.message}
            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Preferred Move-in Date"
            value={inquiryForm.moveInDate}
            onChange={(e) => setInquiryForm({ ...inquiryForm, moveInDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Stay Duration</InputLabel>
            <Select
              value={inquiryForm.stayDuration}
              label="Stay Duration"
              onChange={(e) => setInquiryForm({ ...inquiryForm, stayDuration: e.target.value })}
            >
              <MenuItem value="short_term">Short Term (1-6 months)</MenuItem>
              <MenuItem value="long_term">Long Term (6+ months)</MenuItem>
              <MenuItem value="flexible">Flexible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInquirySubmit}
            variant="contained"
            disabled={inquiryLoading || !inquiryForm.message}
          >
            {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomDetail;