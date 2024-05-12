import { createContext, useContext, useReducer, useMemo } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
const MyContext = createContext();
// Setting custom name for the context
    MyContext.displayName = "MyContextContext";
// React reducer
function reducer (state, action) {
    switch (action.type) {
        case "USER_LOGIN": {
                return { ...state, userLogin: action.value };
        }
                default: {
                    throw new Error(`Unhandled action type: ${action.type}`);
                }
        }
}
// React context provider
function MyContextControllerProvider({ children }) {
        const initialState = {
            userLogin: null,
        };
        const [controller, dispatch] = useReducer (reducer, initialState);
        const value = useMemo (() => [controller, dispatch], [controller, dispatch]);
        return <MyContext.Provider value={value}>{children}</MyContext.Provider>;

}
//React custom hook for using context
function useMyContextController() {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error(
        "useMyContextController should be used inside the MyContextControllerProvider."
        );
    }
    return context;
}
    //Table
const USERS = firestore().collection("Profile")
    //Actions
const login = (dispatch, email, password) => {
    auth().signInWithEmailAndPassword (email, password) 
    .then(() =>
        USERS.doc(email)
        .onSnapshot(u => {
            const value = u.data();
            console.log("Đăng Nhập Thành Công voi user: ", value);
            dispatch({type: "USER_LOGIN", value});
        })
    )
    .catch(e => alert("Sai user va password"))
    }
    const logout = (dispatch) => {
        auth().signOut().then(() => {
            dispatch({ type: "USER_LOGIN" });
        })
        .catch(error => console.log('Logout thất bại: ', error));
    };
export{
    MyContextControllerProvider,
    useMyContextController,
    login,
    logout,
}