import { useAuthContext } from "../../contexts/AuthContext";
import { Logout } from "./Logout";
import { UnauthenticatedContainer } from "./UnauthenticatedContainer";
import styles from './AuthenticationContainer.module.css';

export const AuthenticationContainer = () => {
    const { isLoggedIn } = useAuthContext();
    
    return <div className={styles['authentication-container']}>
    {!isLoggedIn && <UnauthenticatedContainer />}
    {isLoggedIn && <p>logged in</p>}
    {isLoggedIn && <Logout />}
    </div>
}