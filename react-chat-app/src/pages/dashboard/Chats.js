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
  AppBar,
  Tabs,
  Tab,
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
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const Chats = () => {
  const {
    setGroupChat,
    setChatHistory,
    setLoadingHistory,
    setGroupChatMap,
    groupChatMap,
    setChatList,
    chatList,
    setChatListUnjoin,
    chatListUnjoin
  } = useSettings();

  const theme = useTheme();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const BASE_URL = `${process.env.REACT_APP_API_URL}/v1/api/chat`;
  const ENDPOINT = "/groups/joined";
  const params = {
    limit: 10,
    offset: 0,
    user_uuid: localStorage.getItem("uuid"),
  };

  const getGroups = async () => {
    try {
      // setLoadingHistory(true);
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`, { params });
      console.log("Groups data:", response.data);
      if (response?.data && response.data?.groups?.length > 0) {
        setChatList(response.data.groups);
        setGroupChat(response.data.groups[0]);
        setChatHistory(response.data.groups[0].id);
        setGroupChatMap((prev) => ({
          ...prev,
          [response.data.groups[0].id]: [],
        }));
      }
    } catch (error) {
      setLoadingHistory(false);
      console.error("Error fetching groups:", error);
      throw error; // You might want to handle this error further in your application
    }
  };

  const getUnjoinedGroups = async () => {
    try {
        // setLoadingHistory(true);
        const response = await axios.get(`${BASE_URL}/groups/not-joined`, { params });
        console.log("Unjoined groups data:", response.data);
        if (response?.data && response.data?.groups?.length > 0) {
            setChatListUnjoin(response.data.groups);
            // setGroupChat(response.data.groups[0]);
            // setChatHistory(response.data.groups[0].id);
            // setGroupChatMap((prev) => ({
            //     ...prev,
            //     [response.data.groups[0].id]: [],
            // }));
        }
    } catch (error) {
        // setLoadingHistory(false);
        console.error("Error fetching unjoined groups:", error);
        throw error; // Handle this error appropriately in your application
    } finally {
        // setLoadingHistory(false); // Ensure loading state is reset
    }
};

  useEffect(() => {
    getGroups();
    getUnjoinedGroups();
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
          <Box sx={{}}>
            <AppBar position="static">
              <Tabs
                value={value}
                onChange={handleChange}
                sx={{ background: "#F4DEB3", padding: "8px" }}
              >
                <Tab label="Groups Joined" {...a11yProps(0)} />
                <Tab label="Groups Not Joined" {...a11yProps(1)} />
              </Tabs>
            </AppBar>
            <SwipeableViews
              // axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel value={value} index={0}>
                <Stack spacing={2.4}>
                  <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                    All Chats
                  </Typography>
                  {chatList.length > 0 &&
                    chatList.map((el) => {
                      return <ChatElement key={el.id + ""} {...el} />;
                    })}
                </Stack>
              </TabPanel>
              <TabPanel value={value} index={1}>
              <Stack spacing={2.4}>
                  <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                    All Chats
                  </Typography>
                  {chatListUnjoin.length > 0 &&
                    chatListUnjoin.map((el) => {
                      return <ChatElement key={el.id + ""} {...el} />;
                    })}
                </Stack>
              </TabPanel>
            </SwipeableViews>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Chats;
