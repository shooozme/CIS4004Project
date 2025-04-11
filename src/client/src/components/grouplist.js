import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemSecondaryAction,
  Avatar, 
  IconButton, 
  Tooltip,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const GroupList = ({ groups }) => {
  const navigate = useNavigate();

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  if (!groups || groups.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography variant="body1" color="textSecondary">
          You haven't joined any groups yet. Create a new group to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {groups.map((group, index) => (
        <React.Fragment key={group._id}>
          <ListItem>
            <ListItemAvatar>
              <Avatar style={{ backgroundColor: group.color || '#4285F4' }}>
                <PeopleIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={group.name}
              secondary={`${group.members.length} ${group.members.length === 1 ? 'member' : 'members'}`}
            />
            <ListItemSecondaryAction>
              <Tooltip title="View Group">
                <IconButton edge="end" onClick={() => handleViewGroup(group._id)}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          {index < groups.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default GroupList;