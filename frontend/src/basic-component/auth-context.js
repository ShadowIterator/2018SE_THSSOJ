import React from 'react';

export const auth_state = {
    state: false,
    id: -1,
    role: -1
};

export const AuthContext = React.createContext(auth_state);