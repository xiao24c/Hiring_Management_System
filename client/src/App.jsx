import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRouter from "./routes/AppRouter";
import { restoreSession } from "./store/authSlice";

export default function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(restoreSession());
    }
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
