import * as React from "react";
import "./Header.css";
import SearchIcon from "@material-ui/icons/Search";
import { Input, InputAdornment, IconButton, Avatar } from "@material-ui/core";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false
    };
  }
  handleChange(e) {
    this.props.onFilter(e.target.value);
  }
  toggleDropdown = () => {
    if (this.state.showDropdown) {
      this.setState({ showDropdown: false });
    } else {
      this.setState({ showDropdown: true });
    }
  };
  goToProfile = () => {
    window.location = "/profile";
  };
  logout = () => {
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("mediaObjects");
    sessionStorage.removeItem("username");
    window.location = "/";
  };
  render() {
    const { homepageHeader, url, goToHome } = this.props;
    const { showDropdown } = this.state;
    return (
      <React.Fragment>
        {homepageHeader ? (
          <div className="logo-home">
            {goToHome ? (
              <a href="/home" className="profile-page-logo">
                Image Viewer
              </a>
            ) : (
              <span>Image Viewer</span>
            )}
            <div className="search-profile-wrapper">
              <Input
                id="username"
                type="search"
                className="search"
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                placeholder="Search..."
                onChange={e => this.handleChange(e)}
              />
              <IconButton
                aria-label="pic"
                onClick={this.toggleDropdown}
                className="pic-wrapper"
              >
                <Avatar aria-label="recipe">
                      <img
                        src={url}
                        alt="user"
                        className="profile-pic"
                      />
                    </Avatar>
                {/* <img src={url} className="profile-pic" alt="pic" /> */}
              </IconButton>
              {showDropdown ? (
                <div className="dropdown">
                  <p className="option account" onClick={this.goToProfile}>
                    My Account
                  </p>
                  <hr></hr>
                  <p className="option logout" onClick={this.logout}>
                    Logout
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <h2 className="logo">Image Viewer</h2>
        )}
      </React.Fragment>
    );
  }
}
