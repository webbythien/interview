import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DotsThreeVertical, DownloadSimple } from "phosphor-react";
import React, { useEffect, useState } from "react";
import { Message_options } from "../../data";
import { deepOrange } from "@mui/material/colors";
import { Image } from 'antd';

const getIncomingStatus = (el) => {
  const localUuid = localStorage.getItem("uuid");
  const uuid = el.uuid + "";
  return uuid !== localUuid + "";
};

const DocMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);

  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <Avatar>N</Avatar>}
      <Box
        p={1.5}
        sx={{
          backgroundColor: incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            spacing={3}
            direction="row"
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Image size={48} />
            <Typography variant="caption">{el.doc.name}</Typography>
            <IconButton>
              <a href={el.doc.link} download={el.doc.name} target="_blank" rel="noreferrer">
                <DownloadSimple />
              </a>
            </IconButton>
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: incoming ? theme.palette.text : "#fff" }}
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {!incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      {menu && <MessageOptions />}
    </Stack>
  );
};

const LinkMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  const [metaData, setMetaData] = useState({ title: "", image: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await fetch(
          `/api/metadata?url=${encodeURIComponent(el.link)}`
        );
        const data = await response.json();
        setMetaData({
          title: data.title || "No Title",
          image: data.image || "",
        });
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
        setMetaData({
          title: "Failed to fetch title",
          image: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetaData();
  }, [el.link]);

  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      <Box
        p={1.5}
        sx={{
          backgroundColor: incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            spacing={3}
            alignItems="start"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                {metaData.image && (
                  <img
                    src={metaData.image}
                    alt={metaData.title}
                    style={{ maxHeight: 210, borderRadius: "10px" }}
                  />
                )}
                <Stack spacing={2}>
                  <Typography variant="subtitle2">{metaData.title}</Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.primary.main }}
                    component={Link}
                    to={el.link}
                  >
                    {el.link}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color={incoming ? theme.palette.text : "#fff"}
                >
                  {el.message}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
      </Box>
      {!incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      {menu && <MessageOptions />}
    </Stack>
  );
};

const ReplyMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      <Box
        p={1.5}
        sx={{
          backgroundColor: incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color={theme.palette.text}>
              {el.message}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color={incoming ? theme.palette.text : "#fff"}
          >
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      {!incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      {menu && <MessageOptions />}
    </Stack>
  );
};
const MediaMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      <Box
        p={1.5}
        sx={{
          backgroundColor: incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={1}>
          <Image.PreviewGroup
            preview={{
              onChange: (current, prev) =>
                console.log(`current index: ${current}, prev index: ${prev}`),
            }}
          >
            {el.img.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={el.message}
                style={{ maxHeight: 120, borderRadius: "10px",objectFit:'cover' }}
              />
            ))}
          </Image.PreviewGroup>
          <Typography
            variant="body2"
            color={incoming ? theme.palette.text : "#fff"}
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {!incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      {menu && <MessageOptions />}
    </Stack>
  );
};

const TextMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      <Box
        p={1.5}
        sx={{
          backgroundColor: incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Typography
          variant="body2"
          color={incoming ? theme.palette.text : "#fff"}
        >
          {el.message}
        </Typography>
      </Box>
      {!incoming && <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>}
      {menu && <MessageOptions />}
    </Stack>
  );
};

const TimeLine = ({ el }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text }}>
        {el.text}
      </Typography>
      <Divider width="46%" />
    </Stack>
  );
};

const MessageOptions = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el) => (
            <MenuItem onClick={handleClick}>{el.title}</MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
};

// should not be default export, because we need to export multiple things
export { TimeLine, TextMsg, MediaMsg, ReplyMsg, LinkMsg, DocMsg };
