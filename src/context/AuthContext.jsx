import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 Load user on app start
    useEffect(() => {
       const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (token && user) {
    setUser({
        token,
        ...user,
    });
}

        setLoading(false);
    }, []);

    const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser({
        token,
        ...user,
    });
};

    const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
};

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};