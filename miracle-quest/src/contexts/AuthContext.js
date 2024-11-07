import { createContext } from 'react';

const initialAuthContext = {
    user: null,
    loading: true
};

export const AuthContext = createContext(initialAuthContext);