// provider === component
import { createContext, useEffect, useState } from "react";
import { defaultSettings } from "../config";
import useLocalStorage from "../hooks/useLocalStorage";
import getColorPresets, {
  defaultPreset,
  colorPresets,
} from "../utils/getColorPresets";
import io from "socket.io-client";
import axios from "axios";

const initialState = {
  ...defaultSettings,

  // Mode
  onToggleMode: () => {},
  onChangeMode: () => {},

  // Direction
  onToggleDirection: () => {},
  onChangeDirection: () => {},
  onChangeDirectionByLang: () => {},

  // Layout
  onToggleLayout: () => {},
  onChangeLayout: () => {},

  // Contrast
  onToggleContrast: () => {},
  onChangeContrast: () => {},

  // Color
  onChangeColor: () => {},
  setColor: defaultPreset,
  colorOption: [],

  // Stretch
  onToggleStretch: () => {},

  // Reset
  onResetSetting: () => {},
};

const SettingsContext = createContext(initialState);

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useLocalStorage("settings", {
    themeMode: initialState.themeMode,
    themeLayout: initialState.themeLayout,
    themeStretch: initialState.themeStretch,
    themeContrast: initialState.themeContrast,
    themeDirection: initialState.themeDirection,
    themeColorPresets: initialState.themeColorPresets,
  });

  const isArabic = localStorage.getItem("i18nextLng") === "ar";

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang("ar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  // Mode

  const onToggleMode = () => {
    setSettings({
      ...settings,
      themeMode: settings.themeMode === "light" ? "dark" : "light",
    });
  };

  const onChangeMode = (event) => {
    setSettings({
      ...settings,
      themeMode: event.target.value,
    });
  };

  // Direction

  const onToggleDirection = () => {
    setSettings({
      ...settings,
      themeDirection: settings.themeDirection === "rtl" ? "ltr" : "rtl",
    });
  };

  const onChangeDirection = (event) => {
    setSettings({
      ...settings,
      themeDirection: event.target.value,
    });
  };

  const onChangeDirectionByLang = (lang) => {
    setSettings({
      ...settings,
      themeDirection: lang === "ar" ? "rtl" : "ltr",
    });
  };

  // Layout

  const onToggleLayout = () => {
    setSettings({
      ...settings,
      themeLayout:
        settings.themeLayout === "vertical" ? "horizontal" : "vertical",
    });
  };

  const onChangeLayout = (event) => {
    setSettings({
      ...settings,
      themeLayout: event.target.value,
    });
  };

  // Contrast

  const onToggleContrast = () => {
    setSettings({
      ...settings,
      themeContrast: settings.themeContrast === "default" ? "bold" : "default",
    });
  };

  const onChangeContrast = (event) => {
    setSettings({
      ...settings,
      themeContrast: event.target.value,
    });
  };

  // Color

  const onChangeColor = (event) => {
    setSettings({
      ...settings,
      themeColorPresets: event.target.value,
    });
  };

  // Stretch

  const onToggleStretch = () => {
    setSettings({
      ...settings,
      themeStretch: !settings.themeStretch,
    });
  };

  // Reset

  const onResetSetting = () => {
    setSettings({
      themeMode: initialState.themeMode,
      themeLayout: initialState.themeLayout,
      themeStretch: initialState.themeStretch,
      themeContrast: initialState.themeContrast,
      themeDirection: initialState.themeDirection,
      themeColorPresets: initialState.themeColorPresets,
    });
  };


  const [groupChat, setGroupChat] = useState(0)
  const [chatHistory, setChatHistory] = useState([])

  const [loadingHistory, setLoadingHistory] = useState(true)
  const connectSocket = () => {
    const userId = localStorage.getItem("uuid")
    // Connect to the Socket.io server
    const socket = io("https://prm-socket.webbythien.com");

    socket.on("connect", () => {
      console.log("Connected to the Socket.io server", socket.id);

      // Subscribe to a merchant - change merchant_id
      socket.emit("subscribe", { room_id: `${userId}` });
      console.log("emit subscribe with user id ", userId);

      // socket.off("notification");
      socket.off("message");
      // Get notification
      socket.on("message", (data) => {
        const { task_id, ...restData } = data;

        setChatHistory((prevChatHistory) => {
          const index = prevChatHistory.findIndex(item => item.id === data.task_id);
      
          if (index > -1) {
            const updatedChatHistory = [...prevChatHistory];
            updatedChatHistory[index] = restData;
            return updatedChatHistory;
          } else {
            return [...prevChatHistory, data];
          }
        });
      });
     
    });

    // Event handler for disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from the Socket.io server", socket.id);
    });

    // Event handler for errors
    socket.on("error", (e) => {
      console.log("Error", e);
    });

    // Clean up the socket connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  };

  useEffect(()=>{
    connectSocket()
  },[])

  const fetchMessages = async (groupId, limit, offset, startId = null) => {
    try {
      const response = await axios.get(`http://localhost:8000/v1/api/chat/groups/${groupId}/messages`, {
        params: {
          limit,
          offset,
          start_id: startId
        }
      }); 
      setChatHistory(response.data.messages)
      console.log("response.data: ", response)
      setLoadingHistory(false)
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoadingHistory(false)
      // throw error; // Optionally rethrow the error to be handled by the calling code
    }
  };
  useEffect(()=>{
    fetchMessages(groupChat?.id)
  },[groupChat])

  
  return (
    <SettingsContext.Provider
      value={{
        ...settings, // Mode
        onToggleMode,
        onChangeMode,

        // Direction
        onToggleDirection,
        onChangeDirection,
        onChangeDirectionByLang,

        // Layout
        onToggleLayout,
        onChangeLayout,

        // Contrast
        onChangeContrast,
        onToggleContrast,

        // Stretch
        onToggleStretch,

        // Color
        onChangeColor,
        setColor: getColorPresets(settings.themeColorPresets),
        colorOption: colorPresets.map((color) => ({
          name: color.name,
          value: color.main,
        })),

        // Reset
        onResetSetting,

        groupChat,
        setGroupChat,
        chatHistory,
        setChatHistory,
        loadingHistory,
        setLoadingHistory
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export {SettingsContext};

export default SettingsProvider;