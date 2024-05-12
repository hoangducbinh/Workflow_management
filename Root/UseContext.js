import React, { useState, createContext } from 'react';
 const AuthenticatedUserContext = createContext({user: null,
    setUser: () => {},});
export default AuthenticatedUserContext;