import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./styles/app.sass";
import Page from "./components/Page";
import Home from "./screens/Home";
import UploadVariants from "./screens/UploadVariants";
import UploadDetails from "./screens/UploadDetails";
import ConnectWallet from "./screens/ConnectWallet";
import Faq from "./screens/Faq";
import Activity from "./screens/Activity";
import Search01 from "./screens/Search01";
import Search02 from "./screens/Search02";
import Profile from "./screens/Profile";
import ProfileEdit from "./screens/ProfileEdit";
import Item from "./screens/Item";
import PageList from "./screens/PageList";

function App({dapp}) {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => (
            <Page state={dapp.state}>
              <Home state={dapp.state}/>
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-variants"
          render={() => (
            <Page state={dapp.state}>
              <UploadVariants />
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-details"
          render={() => (
            <Page state={dapp.state}>
              <UploadDetails />
            </Page>
          )}
        />
        <Route
          exact
          path="/connect-wallet"
          render={() => (
            <Page state={dapp.state}>
              <ConnectWallet connect={dapp.connectWallet} state={dapp.state} dapp={dapp}/>
            </Page>
          )}
        />
        <Route
          exact
          path="/faq"
          render={() => (
            <Page state={dapp.state}>
              <Faq />
            </Page>
          )}
        />
        <Route
          exact
          path="/activity"
          render={() => (
            <Page state={dapp.state}>
              <Activity />
            </Page>
          )}
        />
        <Route
          exact
          path="/search01"
          render={() => (
            <Page state={dapp.state}>
              <Search01 />
            </Page>
          )}
        />
        <Route
          exact
          path="/search02"
          render={() => (
            <Page state={dapp.state}>
              <Search02 />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile"
          render={() => (
            <Page state={dapp.state}>
              <Profile />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile-edit"
          render={() => (
            <Page state={dapp.state}>
              <ProfileEdit />
            </Page>
          )}
        />
        <Route
          exact
          path="/item"
          render={() => (
            <Page state={dapp.state}>
              <Item />
            </Page>
          )}
        />
        <Route
          exact
          path="/pagelist"
          render={() => (
            <Page state={dapp.state}>
              <PageList />
            </Page>
          )}
        />
      </Switch>
    </Router>
  );
}

export default App;
