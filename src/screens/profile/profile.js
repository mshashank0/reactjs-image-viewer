import React from "react";
import {
  Avatar,
  Fab,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
  Input,
  InputLabel,
  FormControl,
  GridList,
  GridListTile
} from "@material-ui/core";

import Header from "../../common/Header";
import { withStyles } from '@material-ui/core/styles';
import EditIcon from "@material-ui/icons/Edit";
import "./profile.css";
import profileImage from '../../assets/upgrad.svg'
import Modal from 'react-modal';
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";



const styles = theme => ({
  avatar: {
    margin: 10,
    width: 50,
    height: 50,
    marginLeft: 200,
  },
  fab: {
    margin: theme.spacing(1),
  },
  gridListMain: {
    transform: 'translateZ(0)',
    cursor: 'pointer'
  },
  hr: {
    width: 460,
  },
  icon: {
    margin: theme.spacing(1),
    fontSize: 32,
  }
})


class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      fullName: "",
      imagesData: [],
      updatedFullname: "",
      emptyFullname: false,
      openModal: false,
      imgModalIsOpen: false,
      clickedImgUrl: "",
      clickedImgId: "",
      clickedImgUserName: "",
      clickedImgCaption: "",
      clickedImgTags: [],
      clickedImgLikes: 0,
      favClick: false,
      commentText: [],
      comments: [],
      commentCount: 0
    };
  }

  componentDidMount() {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      window.location = "/";
      return;
    }

    // Retrieve the JSON string
    var jsonString = localStorage.getItem("mediaObjects");
    if (jsonString !== undefined) {
      // Parse the JSON string back to JS object
      let imagesData = JSON.parse(jsonString);
      const username = sessionStorage.getItem("username");
      this.setState({ username: username, fullName: username});
      this.setState({ imagesData: imagesData });
    }

    if (this.state.imagesData.length <= 0) {
      //Api to get image ids and caption
      fetch(
        `https://graph.instagram.com/me/media?fields=id,caption&access_token=${accessToken}`
      )
        .then(result => {
          //Covert the data to json object
          return result.json();
        })
        .then(data => {
          if (data.data !== undefined) {
            let imagesData = data.data;
            Promise.all(
              imagesData.map(image => {
                return new Promise((resolve) => {
                  //Api to get image details
                  fetch(`https://graph.instagram.com/${image.id}?fields=id,media_type,media_url,username,timestamp&access_token=${accessToken}`)
                    .then(response => {
                      return new Promise(() => {
                        response.json()
                          .then(imageObject => {
                            image.mediaUrl = imageObject.media_url;
                            image.timeStamp = imageObject.timestamp;
                            image.username = imageObject.username;
                            image.mediaType = imageObject.media_type;
                            this.setState({ username: image.username });
                            this.setState({ fullName: image.username });
                            image.userHasLiked = true;
                            image.tags = ["DummyTag"];
                            image.likes = Math.floor(Math.random() * 100) + 1;
                            resolve()
                          })
                      })
                    })
                })
              })

            )
              .then(() => {
                // Convert the media array into JSON string and save it into storage
                //This is done handle multiple API hits on reload as there is limit on API calls
                const result = this.state.imagesData.filter(imageData =>
                  imageData.mediaType === "IMAGE"
                );
                localStorage.setItem("mediaObjects", JSON.stringify(result));
                this.setState({ imagesData: result });
              })
          }

        });
    }
  }

  //Open full name edit modal
  openModal = () => {
    this.setState({ openModal: true });
  };

  //close full name edit modal
  closeModal = () => {
    this.setState({ openModal: false });
  };

  handleChange = (e, type) => {
    const value = e.target.value;
    const nextState = {};
    nextState[type] = value;
    this.setState(nextState);
  };

  //Update full name
  updateFullname = () => {
    const { updatedFullname } = this.state;
    if (updatedFullname.trim() !== "") {
      this.setState({
        fullName: updatedFullname,
        openModal: false,
        emptyFullname: false,
        updatedFullname: ""
      });
    } else {
      this.setState({ emptyFullname: true });
    }
  };

  //Populate values for image details modal
  onImageClickHandler = (image) => {

    this.setState({ clickedImgId: image.id });
    this.setState({ clickedImgUrl: image.mediaUrl });
    this.setState({ clickedImgUserName: image.username });
    this.setState({ clickedImgCaption: image.caption });
    this.setState({ clickedImgTags: image.tags !== undefined ? image.tags : [] });
    this.setState({ clickedImgLikes: image.likes });
    this.openImgModalHandler();
  }

  //Open image details modal
  openImgModalHandler = () => {
    this.setState({ imgModalIsOpen: true });
  }

  //Close image details modal
  closeImgModalHandler = () => {
    this.setState({ imgModalIsOpen: false });
  }

  //Add comment button clicked and append comment
  addButtonClick = () => {
    var count = this.state.commentCount
    var comment = {
      id: count + 1,
      imageId: this.state.clickedImgId,
      username: this.state.username,
      text: this.state.commentText.text,
    }
    count++;
    var comments = [...this.state.comments, comment];
    this.setState({
      ...this.state,
      commentCount: count,
      comments: comments,
      commentText: "",
    })
  };

  //Event to update comment on edit
  onCommentChangeHandler = (event) => {
    var comment = {
      id: this.state.clickedImgId,
      text: event.target.value,
    }
    this.setState({
      ...this.state,
      commentText: comment,
    });
  }

  // Like dislike the icon and increase decrease the count
  liked = id => {
    let favClick = this.state.favClick ? false : true;
    this.setState({ favClick: favClick });
  };

  render() {

    const { classes } = this.props;

    const {
      imagesData,
      username,
      fullName,
      openModal,
      emptyFullname
    } = this.state;

    return (
      <div className="profile-wrapper">
        <Header url={profileImage} homepageHeader={true} goToHome={true} />
        <div className="information-section">
          <Avatar aria-label="recipe">
            <img src={profileImage} alt="profile-pic" className="profile-pic" />
          </Avatar>
          <div className="user-info">
            <p className="username">{username}</p>
            <div className="posts-info">
              <p>Posts: {imagesData.length}</p>
              <p>Follows: 230</p>
              <p>Followed By: 328</p>
            </div>
            <div>
              <span className="fullname">{fullName}</span>
              <Fab
                color="secondary"
                aria-label="edit"
                className="edit-btn"
                onClick={this.openModal}
              >
                <EditIcon />
              </Fab>
              <div>
                <Dialog
                  open={openModal}
                  onClose={this.closeModal}
                  aria-labelledby="form-dialog-title"
                  className="update-modal"
                >
                  <DialogTitle id="form-dialog-title">Edit</DialogTitle>
                  <DialogContent>
                    <TextField
                      margin="dense"
                      id="fullname"
                      label="Full Name *"
                      type="email"
                      fullWidth
                      onChange={e => this.handleChange(e, "updatedFullname")}
                    />
                    {emptyFullname ? (
                      <span className="error">required</span>
                    ) : null}
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={this.updateFullname}
                      color="primary"
                      variant="contained"
                    >
                      Update
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
        <div className="img-grid">
          <React.Fragment>
            <GridList cellHeight={300} cols={3}>
              {imagesData.map(image => (
                <GridListTile key={image.id} cols={1} onClick={() => this.onImageClickHandler(image)} alt={image.caption} >
                  <img src={image.mediaUrl} alt="img" />
                </GridListTile>
              ))}
            </GridList>
          </React.Fragment>
        </div>
        <Modal ariaHideApp={false} isOpen={this.state.imgModalIsOpen} contentLabel="imgPost"
          onRequestClose={this.closeImgModalHandler}>
          <div className="flex-container">
            <div className="leftModal">
              <img src={this.state.clickedImgUrl} className="clickedImg" alt={this.state.clickedImgCaption} />
            </div>
            <div className="rightModal">
              <div className="bottom-flex">
              <div className="modalHeader">
                <span><img src={profileImage} className="userProfilePic" alt={this.state.clickedImgUserName} /></span>
                <span className="clickedImgUserName">{this.state.clickedImgUserName}</span>
              </div>
              <hr className={classes.hr} />
              <div className="modalBody">
                <span>{this.state.clickedImgCaption}</span><br />
                {this.state.clickedImgTags.map(tag => (
                  <span key={"tag" + Math.floor(Math.random() * 100) + 1} className="captionTag">{"#" + tag + ""}</span>
                ))}
                <div className="comments-block" key="comments-block">
                  {this.state.comments.map(comment => (
                    <div className="comment-display" key={"comment" + comment.id + Math.floor(Math.random() * 100) + 1}>
                      <span className="bold-comment-name" >{this.state.clickedImgUserName}:</span> {comment.text}
                    </div>
                  ))}
                </div>
                </div>
              </div>
              <div className="bottom-flex">
                <div>
                  {this.state.favClick ? (
                    <p className="likes">
                      <FavoriteIcon
                        color="error"
                        className="like-icon"
                        onClick={() => this.liked(this.state.clickedImgId)}
                      />
                      <span className="like-number">
                        &nbsp;{this.state.clickedImgLikes + 1} likes
                          </span>
                    </p>
                  ) : (
                      <p className="likes">
                        <FavoriteBorderIcon
                          className="like-icon"
                          onClick={() => this.liked(this.state.clickedImgId)}
                        />
                        <span className="like-number">
                          &nbsp;{this.state.clickedImgLikes} likes
                          </span>
                      </p>
                    )}
                </div>
                <div >
                  <FormControl
                    fullWidth={true}
                    margin="normal"
                    className="comment-form"
                  >
                    <InputLabel htmlFor="addComment"> &nbsp; Add a comment</InputLabel>
                    <Input className="comment-input" id="addComment" type="text" comment={this.state.addComment} onChange={(event) => this.onCommentChangeHandler(event)} value={this.state.commentText.text !== undefined ? this.state.commentText.text : ""} />
                    <Button variant="contained" color="primary" onClick={() => this.addButtonClick()}>
                      ADD
                        </Button>
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withStyles(styles)(Profile);
