import React, { SetStateAction, useContext, useEffect, useState } from "react";
import "./accounts-tab.css";
import AccountManagement from "./components/AccountManagement/AccountManagement";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import Login from "./components/LogIn/Login";
import Signup from "./components/SignUp/Signup";
import { AuthContext } from "../../../common/contexts/authContext";
import { IconButton, Snackbar } from "@mui/material";
import { setCartId, syncCart } from "../../features/Cart/cartSlice";
import { useAppDispatch } from "../../hooks/reduxHooks";

interface Props {
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
}
const AccountsTab: React.FC<Props> = ({
    setAccountsTabVisible,
    accountsTabVisible,
}) => {
    const auth = useContext(AuthContext);
    const dispatch = useAppDispatch();
    const [creating, setCreating] = useState<boolean>(false);
    const loggedIn = auth && auth.user && !auth.isTokenExpired();

    useEffect(() => {
        if (auth && auth.user && auth.cartId) {
            dispatch(setCartId({ cartId: auth.cartId }));
            dispatch(syncCart());
            auth.clearAuthCart();
        }
    }, [auth]);

    useEffect(() => {
        if (!accountsTabVisible) {
            setTimeout(() => {
                setCreating(false);
            }, 301);
        }
    }, [accountsTabVisible]);

    return (
        <div
            className="customer-accounts"
            style={
                accountsTabVisible
                    ? { transform: "translateX(0)", display: "flex" }
                    : undefined
            }
        >
            <div className="close-accounts-tab-btn">
                <IconButton onClick={() => setAccountsTabVisible(false)}>
                    <CloseSharpIcon />
                </IconButton>
            </div>
            {loggedIn && (
                (<AccountManagement
                    accountsTabVisible={accountsTabVisible}
                    setAccountsTabVisible={setAccountsTabVisible}
                />)
                // <div>Account Management features are not yet available.</div>
            )}
            {!loggedIn && !creating && (
                <Login
                    setCreating={setCreating}
                    accountsTabVisible={accountsTabVisible}
                />
            )}
            {!loggedIn && creating && (
                <Signup
                    setCreating={setCreating}
                    accountsTabVisible={accountsTabVisible}
                />
            )}
        </div>
    );
};
export default AccountsTab;
