import {
  Box,
  IconButton,
  Stack,
  Typography,
  InputBase,
  Button,
  Divider,
  Avatar,
  Badge,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { ChatList } from "../../data";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import axios from "axios";
import useSettings from "../../hooks/useSettings";

const Chats = () => {
  const { setGroupChat,setChatHistory } = useSettings();

  const theme = useTheme();
  const BASE_URL = "http://localhost:8000/v1/api/chat";
  const ENDPOINT = "/groups";
  const params = {
    limit: 10,
    offset: 0,
  };

  const [chatList, setChatList] = useState([])
  const getGroups = async () => {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`, { params });
      console.log("Groups data:", response.data);
      if (response?.data && response.data?.groups?.length >0 ){
        setChatList(response.data.groups)
        setGroupChat(response.data.groups[0])
        setChatHistory(response.data.groups[0].id)
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error; // You might want to handle this error further in your application
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Chats</Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
        </Stack>

        <Stack sx={{ width: "100%" }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Stack>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>New Group</Button>
          </Stack>
          <Divider />
        </Stack>

        <Stack
          className="scrollbar"
          spacing={2}
          direction="column"
          sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
        >
          {/* <Stack spacing={2.4}>
              <Typography variant='subtitle2' sx={{color:"#676767"}}>
                Pinned
              </Typography>
              {ChatList.filter((el)=> el.pinned).map((el)=>{
                return <ChatElement  {...el}/>
              })}
              
            </Stack> */}

          <Stack spacing={2.4}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              All Chats
            </Typography>
            {chatList.length > 0 && chatList.map((el) => {
              return <ChatElement {...el} />;
            })}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Chats;
