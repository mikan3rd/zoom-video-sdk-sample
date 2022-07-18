import React from "react";

import { ChatClient } from "../types/index-types.d";
export default React.createContext<ChatClient | null>(null);
