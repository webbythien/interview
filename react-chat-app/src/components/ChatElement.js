import { Avatar, Badge, Box, Button, Stack, Typography } from '@mui/material';
import {useTheme , styled} from '@mui/material/styles';
import StyledBadge from './StyledBadge';
import useSettings from '../hooks/useSettings';

//single chat element
const ChatElement = ({id,name, img, msg, time, online, unread, member_count, recent_senders, sent, join_group}) => {
  
   
    const { groupChat, setGroupChat,setLoadingHistory,groupChatMap,unreadMap,setUnreadMap  } = useSettings();
    

    const handleSetGroupChat = () =>{
      try {
        // if (!join_group){
        //   return
        // }

        if (groupChat.id !== id ){
          setLoadingHistory(true)
          setGroupChat({id,name, img, msg, time,online, unread,member_count,recent_senders,sent,join_group })
          } 
          setUnreadMap((prevUnread) => {
            return {
              ...prevUnread,
              [id]:0
            };
          });
      } catch (error) {
        setLoadingHistory(false)
      }
     
    }
    const theme = useTheme();
    const truncateMessage = (msg, charLimit) => {
      if (msg.length > charLimit) {
        return msg.slice(0, charLimit) + '...';
      }
      return msg;
    };
    return (
      <Box
      onClick={handleSetGroupChat}
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: theme.palette.mode === 'light'? "#fff" : theme.palette.background.default,
        cursor:"pointer",
        background:`${groupChat.id === id ? "burlywood" : "#fff"}`

      }}
        p={2}

        >
        <Stack direction="row" alignItems='center' justifyContent='space-between'>
          <Stack direction='row' spacing={2}>
            
            {online ? <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot">
            <Avatar src={img} />
            </StyledBadge> : <Avatar src={img} /> }
            
            <Stack spacing={0.3}>
              <Typography variant='subtitle2'>
                {name}
              </Typography>
              {join_group?
              <Typography variant='caption'>
                {truncateMessage((groupChatMap[id])?.length> 0 ?(groupChatMap[id])[groupChatMap[id].length - 1]?.message || msg : msg, 7)}
              </Typography>
              :
              <Button>
                Join Group  
              </Button>
              }
            </Stack>
            </Stack>
            <Stack spacing={2} alignItems='center'>
              {/* <Typography sx={{fontWeight:600}} variant='caption'>
                {time}
              </Typography> */}
              <Badge color='primary' badgeContent={unreadMap[id] || 0}>
  
              </Badge>
            </Stack>
          
          
        </Stack>
  
  
      </Box>
    )
  };

  export default ChatElement