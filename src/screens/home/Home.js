import React from "react";
import Header from "../../common/Header";
import profileImage from '../../assets/upgrad.svg'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Input,
  InputLabel,
  GridListTile
} from "@material-ui/core";
import "./Home.css";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      imagesData: [],
      filterImages: [],
      commentCount: 0,
      username: "",
      comments: [],
      commentText: []
    };
  }
  componentDidMount() {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken ) {
      window.location = "/";
      return;
    }

    // Retrieve the JSON string
    var jsonString = localStorage.getItem("mediaObjects");
    if (jsonString !== undefined) {
      // Parse the JSON string back to JS object
      let imagesData = JSON.parse(jsonString);
      this.setState({ imagesData: imagesData, filterImages: imagesData });
    }

    //Fetch list of media ids along with caption
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
            var imagesData = data.data;
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
                            image.timestamp = imageObject.timestamp;
                            image.username = imageObject.username;
                            image.mediaType = imageObject.media_type;
                            image.tags = ["DummyTag"];
                            this.setState({username: imageObject.username})
                            image.userHasLiked = false;
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
                const result = imagesData.filter(imageData =>
                  imageData.mediaType === "IMAGE"
                );
                sessionStorage.setItem(
                  "username",
                  this.state.username
                );
                localStorage.setItem("mediaObjects", JSON.stringify(result));
                this.setState({ imagesData: result, filterImages: result });
              })
          }

        });
    }

  }

  //This will filter the data based on the typed string in serach box
  filterData = str => {
    const { imagesData } = this.state;
    if (imagesData) {
      if (str !== undefined && str !== "") {
        var result = imagesData.filter(imageData =>
          (imageData.caption !== undefined && imageData.caption.toUpperCase().includes(str.toUpperCase()))
        );
        this.setState({ filterImages: result });
      }
      else {
        this.setState({ filterImages: imagesData });
      }
    }
  };

  //This will convert timestamo of post image to dd/mm/yyyy HH:MM:SS format
  dateConvertor = timestamp => {
    let newDate = new Date(timestamp);
    let year = newDate.getFullYear();
    let monthNo = newDate.getMonth() + 1;
    let date = newDate.getDate();
    let hour = newDate.getHours();
    let min = newDate.getMinutes();
    let sec = newDate.getSeconds();
    hour = hour % 12;
    hour = hour || 12;
    min = min < 10 ? "0" + min : min;
    date = date < 10 ? "0" + date : date;
    monthNo = monthNo < 10 ? "0" + monthNo : monthNo;
    let time = hour + ":" + min + ":" + sec;
    let dateObj = {
      time: time,
      calSlashDate: date + "/" + monthNo + "/" + year.toString()
    };
    return dateObj.calSlashDate + " " + dateObj.time;
  };

  // Like dislike the icon and increase decrease the count
  liked = id => {
    const { filterImages } = this.state;
    filterImages.map(img => {
      if (img.id === id) {
        img.userHasLiked = img.userHasLiked ? false : true;
      }
      return img.userHasLiked;
    });
    this.setState({ filterImages: filterImages });
  };

  //Add comment button clicked
  addButtonClick = (imageId) => {
    var count = this.state.commentCount
    var comment = {
      id: count + 1,
      imageId: imageId,
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

  //Hanlder to edit comment
  onCommentChangeHandler = (event, imageId) => {
    var comment = {
      id: imageId,
      text: event.target.value,
    }
    this.setState({
      ...this.state,
      commentText: comment,
    });
  }

  // Render method for component
  render() {
    const { filterImages } = this.state;
    return (
      <React.Fragment>
        <Header
          homepageHeader={true}
          url={profileImage}
          onFilter={this.filterData}
        />
        <div className="card-wrapper">
          {filterImages && filterImages.length > 0
            ? filterImages.map(img => (
              <Card className="card" key={img.id}>
                <CardHeader
                  avatar={
                    <Avatar aria-label="recipe">
                      <img
                        src={profileImage}
                        alt="user"
                        className="profile-pic"
                      />
                    </Avatar>
                  }
                  title={img.username}
                  subheader={this.dateConvertor(img.timestamp)}
                />
                <CardContent>
                  <div className="content">
                    <GridListTile key={"userImg" + img.id} className="user-image-grid-item">
                      <img
                        src={img.mediaUrl}
                        alt={img.caption}
                        className="post-pic"
                      />
                    </GridListTile>
                    <hr />
                    <div className="caption">{img.caption}</div>
                    {img.tags
                      ? img.tags.map(tag => (
                        <span className="hashtags" key={tag}>
                          #{tag}&nbsp;
                        </span>
                      ))
                      : null}
                    {img.userHasLiked ? (
                      <p className="likes">
                        <FavoriteIcon
                          color="error"
                          className="like-icon"
                          onClick={() => this.liked(img.id)}
                        />
                        <span className="like-number">
                          &nbsp;{img.likes + 1} likes
                          </span>
                      </p>
                    ) : (
                        <p className="likes">
                          <FavoriteBorderIcon
                            className="like-icon"
                            onClick={() => this.liked(img.id)}
                          />
                          <span className="like-number">
                            &nbsp;{img.likes} likes
                          </span>
                        </p>
                      )}
                    <div className="comments-block">
                      {this.state.comments.map(comment => (
                        img.id === comment.imageId ?
                          <div className="comment-display" key={comment.id}>
                            <span className="bold-comment-name" >{img.username}:</span> {comment.text}
                          </div> : null
                      ))}
                    </div>
                    <FormControl
                      fullWidth={true}
                      margin="normal"
                      className="comment-form"
                    >
                      <InputLabel htmlFor="addComment">Add a comment</InputLabel>
                      <Input className="comment-input" id={"addComment" + img.id} type="text" comment={this.state.addComment} onChange={(event) => this.onCommentChangeHandler(event, img.id)} value={img.id === this.state.commentText.id ? this.state.commentText.text : ""} />
                      <Button variant="contained" color="primary" onClick={() => this.addButtonClick(img.id)}>
                        ADD
                        </Button>
                    </FormControl>
                  </div>
                </CardContent>
              </Card>
            ))
            : null}
        </div>

      </React.Fragment>
    );
  }
}
