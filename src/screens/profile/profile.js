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
      userCommentsforImage: []
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

    if (jsonString != undefined) {
      // Parse the JSON string back to JS object
      this.state.imagesData = JSON.parse(jsonString);
      this.setState({ imagesData: this.state.imagesData });
    }

    if (this.state.imagesData.length <= 0) {
      console.log("Fetch start..........")
      fetch(
        `https://graph.instagram.com/me/media?fields=id,caption&access_token=${accessToken}`
      )
        .then(result => {
          //Covert the data to json object
          return result.json();
        })
        .then(data => {
          if (data.data != undefined) {
            this.state.imagesData = data.data;
            Promise.all(
              this.state.imagesData.map(image => {
                return new Promise((resolve) => {
                  fetch(`https://graph.instagram.com/${image.id}?fields=id,media_type,media_url,username,timestamp&access_token=${accessToken}`)
                    .then(response => {
                      return new Promise(() => {
                        response.json()
                          .then(imageObject => {
                            image.mediaUrl = imageObject.media_url;
                            image.timeStamp = imageObject.timestamp;
                            image.username = imageObject.username;                            
                            image.mediaType = imageObject.media_type;
                            this.state.username = image.username;
                            image.userHasLiked = true;
                            image.likes = 1;
                            resolve()
                          })
                      })
                    })
                })
              })

            )
              .then(() => {
                const result = this.state.imagesData.filter(imageData =>
                  imageData.mediaType === "IMAGE"
                );
                this.setState({ imagesData: result });
              })
          }

        });
    }
  }
  openModal = () => {
    this.setState({ openModal: true });
  };
  closeModal = () => {
    this.setState({ openModal: false });
  };
  handleChange = (e, type) => {
    const value = e.target.value;
    const nextState = {};
    nextState[type] = value;
    this.setState(nextState);
  };
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

  onImageClickHandler = (image) => {
    
    this.setState({ clickedImgId: image.id });
    this.setState({ clickedImgUrl: image.mediaUrl });
    this.setState({ clickedImgUserName: image.username });
    this.setState({ clickedImgCaption: image.caption });
    this.setState({ clickedImgTags:  image.tags != undefined ? image.tags : []});
    this.setState({ clickedImgLikes: image.likes });
    console.log(image.caption + ", " + this.state.clickedImgCaption + ", " + this.state.clickedImgUrl);
    this.openImgModalHandler();
  }

  openImgModalHandler = () => {
    this.setState({ imgModalIsOpen: true });
  }

  closeImgModalHandler = () => {
    this.setState({ imgModalIsOpen: false });
  }

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
            <GridList cellHeight={160} cols={3}>
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
              <div className="modalHeader">
                <span><img src={profileImage} className="userProfilePic" alt={this.state.clickedImgUserName} /></span>
                <span className="clickedImgUserName">{this.state.clickedImgUserName}</span>
              </div>
              <hr className={classes.hr} />
              <div className="modalBody">
                <h4 className="captionText">{this.state.clickedImgCaption}</h4>
                {this.state.clickedImgTags.map(tag => (
                  <span className="captionTag">{"#" + tag + ""}</span>
                ))}
                <div className="comments-block">
                  {this.state.comments.map(comment => (
                    this.state.clickedImgId === comment.imageId ?
                      <div className="comment-display" key={comment.id}>
                        {comment.username}: {comment.text}
                      </div> : null
                  ))}
                </div>

              </div>
              <div className="likeSection">
                <span onClick={() => this.setState({ favClick: !this.state.favClick })}>
                  {this.state.favClick === true ? <div>
                    <span className="favIcon"><FavoriteIcon className={classes.icon} /></span>
                    <span className="like">{" " + (this.state.clickedImgLikes) - 1} likes</span> </div> :
                    <div><span><FavoriteBorderIcon className={classes.icon} /></span>
                      <span className="like">{" " + (this.state.clickedImgLikes) + 1} likes</span></div>}
                </span>
              </div>
              <div className="commentAddSection" >
                <FormControl className="formControl">
                  <InputLabel htmlFor="addComment">Add a comment</InputLabel>
                  <Input
                    id="addComment"
                    type="text"
                    comment={this.state.addComment}
                    onChange={(event) => this.onCommentChangeHandler(event, this.state.clickedImgId)} value={this.state.addComment}
                  />
                </FormControl>
                <Button variant="contained" color="primary" className="AddBtn" onClick={() => this.onClickAddBtn(this.state.clickedImgId)}>
                  ADD
                            </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withStyles(styles)(Profile);
