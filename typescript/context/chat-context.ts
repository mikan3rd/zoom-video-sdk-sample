import React from 'react';
import { ChatClient } from '../types/index-types';
export default React.createContext<ChatClient | null>(null);
