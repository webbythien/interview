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
import { Image, Tooltip } from "antd";
import {
  blue,
  green,
  purple,
  red,
  orange,
  pink,
  cyan,
  teal,
  indigo,
  deepPurple,
  lightBlue,
  lime,
  amber,
  deepOrange,
} from "@mui/material/colors";
const colorOptions = [
  blue,
  green,
  purple,
  red,
  orange,
  pink,
  cyan,
  teal,
  indigo,
  deepPurple,
  lightBlue,
  lime,
  amber,
  deepOrange,
];

const shades = [300, 400, 500, 600, 700];

const getIncomingStatus = (el) => {
  const localUuid = localStorage.getItem("uuid");
  const uuid = el.sender_uuid + "";
  return uuid !== localUuid + "";
};
function getColorFromUUID(uuid) {
  if (!uuid) {
    return { backgroundColor: blue[500], color: "#fff" };
  }

  const sum = uuid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = sum % colorOptions.length;

  const shadeIndex = uuid.charCodeAt(0) % shades.length;

  const backgroundColor = colorOptions[colorIndex][shades[shadeIndex]];

  const color = calculateContrastColor(backgroundColor);

  return { backgroundColor, color };
}

function calculateContrastColor(hexColor) {
  // Chuyển đổi hex sang RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#ffffff";
}

const AvatarCustom = ({ uuid, name }) => {
  const { backgroundColor, color } = getColorFromUUID(uuid);

  return (
    <Tooltip placement="top" title={name||"User not found"}>
      <Avatar sx={{ bgcolor: backgroundColor, color: color }}>
        {name ? name[0].toUpperCase() : "O"}
      </Avatar>
    </Tooltip>
  );
};

const DocMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);

  return (
    <Stack direction="column" justifyContent={incoming ? "start" : "end"}>
      <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
        {incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
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
                <a
                  href={el.doc.link}
                  download={el.doc.name}
                  target="_blank"
                  rel="noreferrer"
                >
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
        {!incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
        {menu && <MessageOptions />}
      </Stack>
      <Stack
        direction="row"
        sx={{ marginRight: "1.5" }}
        justifyContent={incoming ? "start" : "end"}
      >
        <Box
          sx={{
            marginRight: `${!incoming ? "44px" : 0}`,
            marginLeft: `${incoming ? "44px" : 0}`,
            width: "max-content",
          }}
        >
          <Typography variant="subtitle2" color={"gray"}>
            {el.sent === 1 && "sending"}
            {el.sent === 2 && "sent"}
            {el.sent === 0 && "failed"}
          </Typography>
        </Box>
      </Stack>
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
    <Stack direction="column" justifyContent={incoming ? "start" : "end"}>
      <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
        {incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
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
                    <Typography variant="subtitle2">
                      {metaData.title}
                    </Typography>
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
        {!incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
        {menu && <MessageOptions />}
      </Stack>
      <Stack
        direction="row"
        sx={{ marginRight: "1.5" }}
        justifyContent={incoming ? "start" : "end"}
      >
        <Box
          sx={{
            marginRight: `${!incoming ? "44px" : 0}`,
            marginLeft: `${incoming ? "44px" : 0}`,
            width: "max-content",
          }}
        >
          <Typography variant="subtitle2" color={"gray"}>
            {el.sent === 1 && "sending"}
            {el.sent === 2 && "sent"}
            {el.sent === 0 && "failed"}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

const ReplyMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  return (
    <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
      {incoming && <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />}
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
      {!incoming && (
        <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
      )}
      {menu && <MessageOptions />}
    </Stack>
  );
};

const MediaMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);

  return (
    <Stack direction="column" justifyContent={incoming ? "start" : "end"}>
      <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
        {incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
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
                  style={{
                    maxHeight: 120,
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
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
        {!incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
        {menu && <MessageOptions />}
      </Stack>
      {el.uuid === localStorage.getItem("uuid") && (
        <Stack
          direction="row"
          sx={{ marginRight: "1.5" }}
          justifyContent={incoming ? "start" : "end"}
        >
          <Box
            sx={{
              marginRight: `${!incoming ? "44px" : 0}`,
              marginLeft: `${incoming ? "44px" : 0}`,
              width: "max-content",
            }}
          >
            <Typography variant="subtitle2" color={"gray"}>
              {el.sent === 1 && "sending"}
              {el.sent === 2 && "sent"}
              {el.sent === 0 && "failed"}
            </Typography>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

const TextMsg = ({ el, menu }) => {
  const theme = useTheme();
  const incoming = getIncomingStatus(el);
  return (
    <Stack direction="column" justifyContent={incoming ? "start" : "end"}>
      <Stack direction="row" justifyContent={incoming ? "start" : "end"}>
        {incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
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
        {!incoming && (
          <AvatarCustom uuid={el.sender_uuid} name={el.sender_name} />
        )}
        {menu && <MessageOptions />}
      </Stack>
      <Stack
        direction="row"
        sx={{ marginRight: "1.5" }}
        justifyContent={incoming ? "start" : "end"}
      >
        <Box
          sx={{
            marginRight: `${!incoming ? "44px" : 0}`,
            marginLeft: `${incoming ? "44px" : 0}`,
            width: "max-content",
          }}
        >
          <Typography variant="subtitle2" color={"gray"}>
            {el.sent === 1 && "sending"}
            {el.sent === 2 && "sent"}
            {el.sent === 0 && "failed"}
          </Typography>
        </Box>
      </Stack>
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
