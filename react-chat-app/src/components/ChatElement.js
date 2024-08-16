import { Avatar, Badge, Box, Button, Stack, Typography } from '@mui/material';
import {useTheme , styled} from '@mui/material/styles';
import StyledBadge from './StyledBadge';
import useSettings from '../hooks/useSettings';
import axios from 'axios';

//single chat element
const ChatElement = ({id,name, img, msg, time, online, unread, member_count, recent_senders, sent, join_group}) => {
  
   
    const { groupChat, setGroupChat,setLoadingHistory,groupChatMap,unreadMap,setUnreadMap,setChatList,
      setChatListUnjoin,  } = useSettings();
    

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

    const handleJoinGroup = async () => {
      try {
        const response = await axios.post('http://localhost:8000/v1/api/chat/join-group', {
          uuid: localStorage.getItem("uuid"),
          username: localStorage.getItem("username"),
          group_id: id,
        });
        console.log("join group",response.data.group);
        const groupJoin = response.data.group
        const groupId = groupJoin.id

        setChatListUnjoin((prevUnjoinList) => {
          const itemToMove = prevUnjoinList.find(item => item.id === groupId);
      
          if (itemToMove) {
            const updatedUnjoinList = prevUnjoinList.filter(item => item.id !== groupId);
            // const newItem = itemToMove
            itemToMove.join_group= true
            setChatList((prevJoinList) => [...prevJoinList, itemToMove]);
      
            return updatedUnjoinList;
          }
      
          return prevUnjoinList;
        });
        setGroupChat({id,name, img, msg, time,online, unread,member_count,recent_senders,sent,join_group: true })
      } catch (error) {
        console.error('Error joining group:', error);
      }
    };

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
              <Button onClick={handleJoinGroup}>
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